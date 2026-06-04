/**
 * Audio Player Utility
 * QUALITY FIX: Manages playback of Azure TTS audio using the Web Audio API (48kHz sample rate)
 * to avoid browser-level recompression/downgrading.
 */

class AudioPlayer {
  constructor() {
    this.audioContext = null;
    this.activeSourceNode = null;
    this.gainNode = null;
    this.isPlaying = false;
    this.volume = 1.0;
    this.audioBuffer = null;
    this.startTime = 0;
    this.pausedTime = 0;
    this.listeners = {
      onPlay: [],
      onPause: [],
      onEnd: [],
      onError: [],
      onTimeUpdate: [],
    };
  }

  /**
   * Initialize audio player
   * @returns {void}
   */
  init() {
    // QUALITY FIX: Use Web Audio API AudioContext with standard 48kHz sample rate matching raw Azure MP3 output
    if (!this.audioContext && typeof window !== "undefined") {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioContext = new AudioContextClass({ sampleRate: 48000 });
      }
    }
  }

  /**
   * Convert any audio source (base64, data URI, blob, URL, or ArrayBuffer) into an ArrayBuffer
   * @private
   * @param {*} source 
   * @returns {Promise<ArrayBuffer>}
   */
  async getArrayBuffer(source) {
    if (source instanceof ArrayBuffer) {
      return source;
    }
    if (source instanceof Blob) {
      return await source.arrayBuffer();
    }
    if (typeof source === "string") {
      // Handle URL source
      if (
        source.startsWith("blob:") || 
        source.startsWith("http://") || 
        source.startsWith("https://") || 
        source.startsWith("/")
      ) {
        const response = await fetch(source);
        return await response.arrayBuffer();
      }
      
      // Handle Base64 / Data URI source
      const base64Data = source.replace(/^data:audio\/[a-z]+;base64,/, "");
      const binaryString = window.atob(base64Data);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      return bytes.buffer;
    }
    throw new Error("Unsupported audio source format");
  }

  /**
   * Play audio from base64, URL, Blob, or ArrayBuffer
   * @param {*} audioSource - The audio data
   * @param {Object} options - Additional options
   * @returns {Promise<void>} Resolves when audio playback finishes
   */
  async play(audioSource, options = {}) {
    // QUALITY FIX: Play directly via Web Audio API decodeAudioData -> BufferSource
    try {
      this.init();
      if (!this.audioContext) {
        throw new Error("Web Audio API not supported/initialized");
      }

      // Resume context if suspended (browser security block)
      if (this.audioContext.state === "suspended") {
        await this.audioContext.resume();
      }

      // Stop current playback before starting new one
      this.stop();

      const arrayBuffer = await this.getArrayBuffer(audioSource);
      
      // Decode audio data (use slice to avoid buffer neutering)
      const bufferToDecode = arrayBuffer.slice(0);
      
      // Decodes audio natively without standard HTML5 compression artifacts
      this.audioBuffer = await this.audioContext.decodeAudioData(bufferToDecode);

      this.volume = options.volume !== undefined ? options.volume : 1.0;
      this.isPlaying = true;
      this.emit("onPlay");

      return new Promise((resolve, reject) => {
        try {
          const sourceNode = this.audioContext.createBufferSource();
          sourceNode.buffer = this.audioBuffer;

          const gainNode = this.audioContext.createGain();
          gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

          sourceNode.connect(gainNode).connect(this.audioContext.destination);

          this.activeSourceNode = sourceNode;
          this.gainNode = gainNode;
          this.startTime = this.audioContext.currentTime;
          this.pausedTime = 0;

          sourceNode.onended = () => {
            if (this.activeSourceNode === sourceNode) {
              this.isPlaying = false;
              this.activeSourceNode = null;
              this.gainNode = null;
              this.emit("onEnd");
              resolve();
            }
          };

          sourceNode.start(0);
        } catch (err) {
          this.isPlaying = false;
          this.activeSourceNode = null;
          this.gainNode = null;
          this.emit("onError", err);
          reject(err);
        }
      });
    } catch (error) {
      console.error("Web Audio API playback error:", error);
      this.emit("onError", error);
      throw error;
    }
  }

  /**
   * Play audio from Blob
   * @param {Blob} audioBlob
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async playFromBlob(audioBlob, options = {}) {
    return this.play(audioBlob, options);
  }

  /**
   * Play audio from URL
   * @param {string} url - Audio URL
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async playFromUrl(url, options = {}) {
    return this.play(url, options);
  }

  /**
   * Pause playback
   */
  pause() {
    // QUALITY FIX: Stop the active source node and calculate elapsed playback offset
    if (this.isPlaying && this.activeSourceNode && this.audioContext) {
      const elapsed = this.audioContext.currentTime - this.startTime + this.pausedTime;
      this.pausedTime = elapsed;
      this.isPlaying = false;
      
      const source = this.activeSourceNode;
      this.activeSourceNode = null;
      try {
        source.stop();
      } catch (err) {
        // Safe catch if already stopped
      }
      this.emit("onPause");
    }
  }

  /**
   * Stop playback and reset
   */
  stop() {
    // QUALITY FIX: Disconnect and stop current Web Audio node
    if (this.activeSourceNode) {
      const source = this.activeSourceNode;
      this.activeSourceNode = null;
      try {
        source.stop();
      } catch (err) {
        // Safe catch if already stopped
      }
    }
    this.isPlaying = false;
    this.pausedTime = 0;
    this.gainNode = null;
  }

  /**
   * Resume playback
   */
  resume() {
    // QUALITY FIX: Re-create buffer source starting from paused offset
    if (!this.isPlaying && this.audioBuffer && this.audioContext) {
      this.isPlaying = true;
      this.emit("onPlay");

      const sourceNode = this.audioContext.createBufferSource();
      sourceNode.buffer = this.audioBuffer;

      const gainNode = this.audioContext.createGain();
      gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);

      sourceNode.connect(gainNode).connect(this.audioContext.destination);

      this.activeSourceNode = sourceNode;
      this.gainNode = gainNode;
      this.startTime = this.audioContext.currentTime;

      sourceNode.onended = () => {
        if (this.activeSourceNode === sourceNode) {
          this.isPlaying = false;
          this.activeSourceNode = null;
          this.gainNode = null;
          this.emit("onEnd");
        }
      };

      const startOffset = Math.max(0, Math.min(this.audioBuffer.duration, this.pausedTime));
      sourceNode.start(0, startOffset);
    }
  }

  /**
   * Set volume (0.0 - 1.0)
   * @param {number} volume
   */
  setVolume(volume) {
    // QUALITY FIX: Adjust standard gain node value
    this.volume = Math.max(0, Math.min(1, volume));
    if (this.gainNode && this.audioContext) {
      this.gainNode.gain.setValueAtTime(this.volume, this.audioContext.currentTime);
    }
  }

  /**
   * Get current volume
   * @returns {number}
   */
  getVolume() {
    return this.volume;
  }

  /**
   * Set playback rate (dummy / Web Audio rate changes require pitch adjustments, keeping signature)
   * @param {number} rate
   */
  setPlaybackRate(rate) {
    // Signature preserved
  }

  /**
   * Get current time
   * @returns {number}
   */
  getCurrentTime() {
    if (this.isPlaying && this.audioContext) {
      return this.pausedTime + (this.audioContext.currentTime - this.startTime);
    }
    return this.pausedTime;
  }

  /**
   * Set current time
   * @param {number} time
   */
  setCurrentTime(time) {
    // QUALITY FIX: Re-seek by restarting from desired offset
    if (this.audioBuffer) {
      const wasPlaying = this.isPlaying;
      this.stop();
      this.pausedTime = Math.max(0, Math.min(this.audioBuffer.duration, time));
      if (wasPlaying) {
        this.resume();
      }
    }
  }

  /**
   * Get duration
   * @returns {number}
   */
  getDuration() {
    return this.audioBuffer ? this.audioBuffer.duration : 0;
  }

  /**
   * Is audio playing
   * @returns {boolean}
   */
  getIsPlaying() {
    return this.isPlaying;
  }

  /**
   * Register event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  on(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
  }

  /**
   * Unregister event listener
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.listeners[event]) {
      this.listeners[event] = this.listeners[event].filter(
        (cb) => cb !== callback,
      );
    }
  }

  /**
   * Emit event
   * @private
   */
  emit(event, data = null) {
    if (this.listeners[event]) {
      this.listeners[event].forEach((callback) => {
        callback(data);
      });
    }
  }

  /**
   * Get dummy audio element (retained for backward-compatibility signatures)
   * @returns {HTMLAudioElement}
   */
  getAudioElement() {
    return null;
  }

  /**
   * Destroy player and cleanup resources
   */
  destroy() {
    // QUALITY FIX: Cleanup Web Audio context
    this.stop();
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.audioBuffer = null;

    // Clear listeners
    Object.keys(this.listeners).forEach((key) => {
      this.listeners[key] = [];
    });
  }
}

// Singleton instance
let playerInstance = null;

/**
 * Get or create audio player instance
 * @returns {AudioPlayer}
 */
export const getAudioPlayer = () => {
  if (!playerInstance) {
    playerInstance = new AudioPlayer();
  }
  return playerInstance;
};

/**
 * Quick play utility
 * @param {*} audioDataOrUrl - Audio data
 * @param {Object} options
 * @returns {Promise<void>}
 */
export const playAudio = async (audioDataOrUrl, options = {}) => {
  const player = getAudioPlayer();
  return player.play(audioDataOrUrl, options);
};

/**
 * Play raw array buffer using Web Audio API
 * @param {ArrayBuffer} arrayBuffer 
 * @param {Object} options 
 * @returns {Promise<void>}
 */
export const playAudioBuffer = async (arrayBuffer, options = {}) => {
  // QUALITY FIX: plays raw arrayBuffer via Web Audio API directly
  const player = getAudioPlayer();
  return player.play(arrayBuffer, options);
};

/**
 * Stop playback
 */
export const stopAudio = () => {
  const player = getAudioPlayer();
  player.stop();
};

/**
 * Pause playback
 */
export const pauseAudio = () => {
  const player = getAudioPlayer();
  player.pause();
};

/**
 * Resume playback
 */
export const resumeAudio = () => {
  const player = getAudioPlayer();
  player.resume();
};

export default {
  AudioPlayer,
  getAudioPlayer,
  playAudio,
  playAudioBuffer,
  stopAudio,
  pauseAudio,
  resumeAudio,
};
