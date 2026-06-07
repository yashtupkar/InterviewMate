import { ISTTProvider } from '../interfaces/ISTTProvider';
import { STTError } from '../types';
import { cleanupEventListeners } from '../utils/cleanup';
import { TranscriptDeduplicator } from '../utils/duplicatePrevention';

export class BrowserSTTProvider extends ISTTProvider {
  constructor(config) {
    super(config);
    this.recognitionRef = null;
    this.stopRequested = false;
    this.deduplicator = new TranscriptDeduplicator();
    this.speechStarted = false;
  }

  static isSupported() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  async initialize() {
    if (!BrowserSTTProvider.isSupported()) {
      throw new STTError('Browser speech recognition not supported', 'UNSUPPORTED', false);
    }
    this._isInitialized = true;
  }

  async start() {
    if (!this._isInitialized) {
      await this.initialize();
    }
    this.stopRequested = false;
    await this._startRecognition();
  }

  async _startRecognition() {
    try {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = this.config.browser?.continuous !== false;
      recognition.interimResults = this.config.browser?.interimResults !== false;
      recognition.lang = this.config.language || 'en-IN';
      this.recognitionRef = recognition;

      recognition.onstart = () => {
        this._isListening = true;
      };

      recognition.onspeechstart = () => {
        if (!this._isPaused && !this.speechStarted) {
          this.speechStarted = true;
          this._emit('onSpeechStart');
        }
      };

      recognition.onspeechend = () => {
        if (!this._isPaused) {
          this.speechStarted = false;
          this._emit('onSpeechEnd');
        }
      };

      recognition.onresult = (event) => {
        if (this._isPaused) return;
        this._handleResult(event);
      };

      recognition.onerror = (event) => {
        this._handleError(event);
      };

      recognition.onend = () => {
        if (!this.stopRequested && this._isListening) {
          this._restartRecognition();
        } else {
          this._isListening = false;
        }
      };

      recognition.start();
    } catch (err) {
      this._emit('onError', new STTError(err.message, 'START_ERROR'));
    }
  }

  _handleResult(event) {
    let finalText = '';
    let interimText = '';

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      const result = event.results[i];
      const transcript = result[0].transcript;
      const confidence = result[0].confidence;

      if (result.isFinal) {
        if (!this.deduplicator.isDuplicate(transcript, true)) {
          finalText += transcript;
          this._emit('onFinalTranscript', { transcript, confidence });
        }
      } else {
        if (!this.deduplicator.isDuplicate(transcript, false)) {
          interimText += transcript;
          this._emit('onInterimTranscript', transcript);
        }
      }
    }
  }

  _handleError(event) {
    const errorCode = event.error;
    let message = 'Speech recognition error';

    switch (errorCode) {
      case 'not-allowed':
        message = 'Microphone access blocked';
        break;
      case 'network':
        message = 'Network error in speech recognition';
        break;
    }

    this._emit('onError', new STTError(message, errorCode.toUpperCase(), errorCode !== 'not-allowed'));
  }

  _restartRecognition() {
    setTimeout(() => {
      if (!this.stopRequested && this.recognitionRef) {
        try {
          this.recognitionRef.start();
        } catch (e) {
          console.warn('[STT:Browser] Failed to restart recognition:', e);
        }
      }
    }, 300);
  }

  async stop() {
    this.stopRequested = true;
    this._isListening = false;
    this._isPaused = false;
    this.speechStarted = false;
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
    if (this.recognitionRef) {
      try {
        cleanupEventListeners(this.recognitionRef, ['start', 'end', 'error', 'result', 'speechstart', 'speechend']);
        this.recognitionRef.abort();
      } catch (e) {
        console.warn('[STT:Browser] Error stopping recognition:', e);
      }
      this.recognitionRef = null;
    }
  }
}
