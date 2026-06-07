import { ISTTProvider } from "../interfaces/ISTTProvider";
import { STTError } from "../types";
import { createPCMRecorder } from "../../../utils/pcmRecorder";
import { closeWebSocket, stopMediaStream } from "../utils/cleanup";
import { TranscriptDeduplicator } from "../utils/duplicatePrevention";
import axios from "axios";

export class DeepgramProvider extends ISTTProvider {
  constructor(config) {
    super(config);
    this.socketRef = null;
    this.pcmRecorderRef = null;
    this.streamRef = null;
    this.reconnectAttempts = 0;
    this.stopRequested = false;
    this.deduplicator = new TranscriptDeduplicator();
    this.dynamicKeywords = [];
  }

  setMuted(value) {
    this._isMuted = value;
  }

  async initialize() {
    this._isInitialized = true;
  }

  async start(dynamicKeywords = []) {
    if (!this._isInitialized) {
      await this.initialize();
    }
    this.stopRequested = false;
    this.dynamicKeywords = dynamicKeywords || [];
    await this._connect();
  }

  async _connect() {
    try {
      await this._cleanup();

      if (!navigator.mediaDevices?.getUserMedia) {
        throw new STTError(
          "Browser does not support microphone access",
          "MIC_UNSUPPORTED",
          false,
        );
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      this.streamRef = stream;

      const tokenResp = await this.config.getToken();
      const res = await axios.post(
        `${this.config.backendUrl}/api/stt/token`,
        {},
        { headers: { Authorization: `Bearer ${tokenResp}` } },
      );
      const token = res.data.token;
      if (!token) {
        throw new STTError("No token returned from backend", "NO_TOKEN", false);
      }

      const wsUrl = this._buildWebSocketUrl(token);
      const ws = new WebSocket(wsUrl, ["token", token]);
      this.socketRef = ws;

      ws.onopen = async () => {
        this.reconnectAttempts = 0;
        this._isListening = true;
        try {
          this.pcmRecorderRef = await createPCMRecorder(
            stream,
            (pcm16Buffer) => {
              if (
                ws.readyState === WebSocket.OPEN &&
                !this._isPaused &&
                !this._isMuted
              ) {
                ws.send(pcm16Buffer);
              }
            },
            (vol) => this._emit("onVolumeChange", vol),
          );
        } catch (err) {
          this._emit(
            "onError",
            new STTError("Failed to start PCM recorder", "PCM_ERROR"),
          );
        }
      };

      ws.onmessage = (event) => {
        this._handleMessage(event);
      };

      ws.onerror = (err) => {
        console.error("[STT:Deepgram] WebSocket error:", err);
        this._emit(
          "onError",
          new STTError("WebSocket error occurred", "WS_ERROR"),
        );
      };

      ws.onclose = () => {
        if (!this.stopRequested && this._isListening) {
          this._handleReconnect();
        }
      };
    } catch (err) {
      this._emit(
        "onError",
        err instanceof STTError
          ? err
          : new STTError(err.message, "CONNECTION_ERROR"),
      );
    }
  }

  _buildWebSocketUrl(token) {
    const model = this.config.model || this.config.deepgram?.model || "nova-3";
    const params = new URLSearchParams({
      encoding: this.config.deepgram?.encoding || "linear16",
      sample_rate: String(this.config.deepgram?.sampleRate || 16000),
      channels: String(this.config.deepgram?.channels || 1),
      smart_format: String(
        this.config.deepgram?.smartFormat !== false ? "true" : "false",
      ),
      model: model,
      language: this.config.language || "en-IN",
      interim_results: String(
        this.config.interimResults !== false ? "true" : "false",
      ),
      utterance_end_ms: String(this.config.deepgram?.utteranceEndMs || 1000),
      vad_events: String(this.config.vadEnabled !== false ? "true" : "false"),
    });

    let wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`;

    const allKeywords = [
      ...(this.config.keywords || []),
      ...this.dynamicKeywords,
    ];
    const isNova3OrFlux = model.includes("nova-3") || model.includes("flux");

    allKeywords.forEach((term) => {
      if (isNova3OrFlux) {
        wsUrl += `&keyterm=${encodeURIComponent(term)}`;
      } else {
        wsUrl += `&keywords=${encodeURIComponent(term)}:2`;
      }
    });

    return wsUrl;
  }

  _handleMessage(event) {
    try {
      const data = JSON.parse(event.data);

      if (data.type === "SpeechStarted") {
        this._emit("onSpeechStart");
        return;
      } else if (data.type === "UtteranceEnd") {
        this._emit("onSpeechEnd");
        return;
      }

      const alternative = data.channel?.alternatives?.[0];
      const transcript = alternative?.transcript || "";
      const isFinal = data.is_final;
      const confidence = alternative?.confidence || 0;

      if (
        transcript.trim() &&
        this.deduplicator.isDuplicate(transcript, isFinal)
      ) {
        return;
      }

      if (transcript.trim()) {
        if (isFinal) {
          this._emit("onFinalTranscript", { transcript, confidence });
        } else {
          this._emit("onInterimTranscript", transcript);
        }
      }
    } catch (e) {
      console.error("[STT:Deepgram] Failed to parse message:", e);
    }
  }

  _handleReconnect() {
    if (!this.config.autoReconnect) return;
    if (this.reconnectAttempts >= (this.config.maxReconnectAttempts || 5)) {
      this._emit(
        "onError",
        new STTError(
          "Max reconnect attempts exhausted",
          "RECONNECT_EXHAUSTED",
          false,
        ),
      );
      return;
    }

    this.reconnectAttempts++;
    const delay =
      (this.config.reconnectDelayMs || 1000) *
      Math.pow(2, this.reconnectAttempts - 1);
    console.log(
      `[STT:Deepgram] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`,
    );
    setTimeout(() => this._connect(), delay);
  }

  async stop() {
    this.stopRequested = true;
    this._isListening = false;
    this._isPaused = false;
    this.deduplicator.clear();
    await this._cleanup();
  }

  async pause() {
    this._isPaused = true;
  }

  async resume() {
    this._isPaused = false;
  }

  async destroy() {
    await this.stop();
    this._isInitialized = false;
  }

  async _cleanup() {
    if (this.pcmRecorderRef) {
      try {
        this.pcmRecorderRef.stop();
      } catch (e) {
        console.warn("[STT:Deepgram] Error stopping PCM recorder:", e);
      }
      this.pcmRecorderRef = null;
    }
    closeWebSocket(this.socketRef);
    this.socketRef = null;
    stopMediaStream(this.streamRef);
    this.streamRef = null;
  }
}
