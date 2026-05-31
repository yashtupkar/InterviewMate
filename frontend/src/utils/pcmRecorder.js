/**
 * Placemate AI - Production-Grade Real-Time PCM16 Audio Recorder
 * 
 * Captures microphone audio using the browser's Web Audio API, downsamples it to 16kHz,
 * converts Float32 samples to 16-bit Signed Linear PCM (PCM16), and computes RMS volume
 * directly inside an AudioWorklet to prevent main-thread blocking.
 * 
 * Usage:
 * const recorder = await createPCMRecorder(
 *   stream,
 *   (pcm16Buffer) => { socket.send(pcm16Buffer); },
 *   (volumeLevel) => { setVolume(volumeLevel); }
 * );
 * ...
 * await recorder.stop();
 */

export const createPCMRecorder = async (stream, onPCMData, onVolume) => {
  const AudioContextAPI = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextAPI) {
    throw new Error("Web Audio API is not supported by this browser.");
  }

  // Create single AudioContext with default native hardware sample rate
  const audioContext = new AudioContextAPI();
  const source = audioContext.createMediaStreamSource(stream);
  const nativeSampleRate = audioContext.sampleRate;

  console.log(`[STT:PCM] Initializing PCM recorder. Native Hardware Sample Rate: ${nativeSampleRate}Hz -> Target: 16000Hz`);

  // AudioWorklet code to handle downsampling, PCM16 conversion, and RMS calculation in a background thread
  const workletCode = `
    class PCMProcessor extends AudioWorkletProcessor {
      constructor(options) {
        super();
        const inSampleRate = options.processorOptions?.inSampleRate || 48000;
        const outSampleRate = options.processorOptions?.outSampleRate || 16000;
        
        this.ratio = inSampleRate / outSampleRate;
        this.inputBuffer = [];
        this.sourceFrame = 0;
        
        console.log('[STT:PCM:Worklet] Processor initialized. Downsampling ratio:', this.ratio);
      }

      process(inputs, outputs, parameters) {
        const input = inputs[0];
        if (!input || input.length === 0) return true;
        const channelData = input[0]; // Process first (mono) channel

        // Push new samples to processing buffer
        for (let i = 0; i < channelData.length; i++) {
          this.inputBuffer.push(channelData[i]);
        }

        const outputSamples = [];
        // Perform fractional linear interpolation downsampling
        while (this.sourceFrame < this.inputBuffer.length - 1) {
          const nextIndex = Math.floor(this.sourceFrame);
          const fraction = this.sourceFrame - nextIndex;
          
          const s0 = this.inputBuffer[nextIndex];
          const s1 = this.inputBuffer[nextIndex + 1];
          const interpolated = s0 + fraction * (s1 - s0);
          
          outputSamples.push(interpolated);
          this.sourceFrame += this.ratio;
        }

        // Slice inputBuffer to discard samples we've completely finished processing
        const sliceIndex = Math.floor(this.sourceFrame);
        if (sliceIndex > 0) {
          this.inputBuffer = this.inputBuffer.slice(sliceIndex);
          this.sourceFrame -= sliceIndex;
        }

        // Convert Float32 samples to PCM16 (Int16) format and calculate RMS volume
        if (outputSamples.length > 0) {
          const pcm16 = new Int16Array(outputSamples.length);
          let sumSquares = 0;

          for (let j = 0; j < outputSamples.length; j++) {
            const s = Math.max(-1, Math.min(1, outputSamples[j]));
            pcm16[j] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            sumSquares += s * s;
          }

          // Root Mean Square (RMS) for precise volume levels
          const rms = Math.sqrt(sumSquares / outputSamples.length);

          // Ship the PCM16 buffer to main thread using transferable objects (zero-copy performance)
          this.port.postMessage({
            pcm16: pcm16.buffer,
            rms: rms
          }, [pcm16.buffer]);
        }

        return true;
      }
    }

    registerProcessor('pcm-processor', PCMProcessor);
  `;

  // Create an inlined Blob URL to load the worklet cleanly without bundler static-asset issues
  const blob = new Blob([workletCode], { type: "application/javascript" });
  const workletUrl = URL.createObjectURL(blob);

  try {
    await audioContext.audioWorklet.addModule(workletUrl);
  } catch (err) {
    console.error("[STT:PCM] Failed to load AudioWorklet module:", err);
    throw err;
  } finally {
    URL.revokeObjectURL(workletUrl);
  }

  // Instantiate standard AudioWorkletNode
  const pcmNode = new AudioWorkletNode(audioContext, "pcm-processor", {
    processorOptions: {
      inSampleRate: nativeSampleRate,
      outSampleRate: 16000,
    },
  });

  // Listen to messages from AudioWorklet background thread
  pcmNode.port.onmessage = (event) => {
    const { pcm16, rms } = event.data;
    if (pcm16 && onPCMData) {
      onPCMData(pcm16);
    }
    if (rms !== undefined && onVolume) {
      // Convert RMS [0.0, 1.0] to visual volume scale [0, 100]
      // RMS of speech usually hovers below 0.35, so a multiplier of 250 offers clean sensitivity
      const vol = Math.min(100, Math.round(rms * 250));
      onVolume(vol);
    }
  };

  // Connect Web Audio Graph: Mic Stream Source -> PCM AudioWorkletNode
  source.connect(pcmNode);

  // Resume context if suspended (browser security autoplays)
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }

  console.log("[STT:PCM] AudioWorklet PCM streaming initialized successfully.");

  return {
    stop: async () => {
      console.log("[STT:PCM] Stopping PCM recorder and cleaning up nodes...");
      try {
        source.disconnect();
        pcmNode.disconnect();
        pcmNode.port.onmessage = null;
      } catch (e) {
        console.warn("[STT:PCM] Error disconnecting Web Audio nodes:", e);
      }
      try {
        if (audioContext.state !== "closed") {
          await audioContext.close();
        }
      } catch (e) {
        console.warn("[STT:PCM] Error closing AudioContext:", e);
      }
    },
    sampleRate: 16000,
  };
};
