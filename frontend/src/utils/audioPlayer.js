/**
 * Audio Player Utility
 * Manages playback of Polly-generated audio
 */

class AudioPlayer {
  constructor() {
    this.audioElement = null;
    this.audioContext = null;
    this.isPlaying = false;
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
    if (!this.audioElement) {
      this.audioElement = new Audio();
      this.setupEventListeners();
    }

    // Initialize Web Audio API context for advanced features
    if (!this.audioContext && typeof window !== "undefined") {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioContext = new AudioContext();
      }
    }
  }

  /**
   * Setup event listeners for audio element
   * @private
   */
  setupEventListeners() {
    if (!this.audioElement) return;

    this.audioElement.addEventListener("play", () => {
      this.isPlaying = true;
      this.emit("onPlay");
    });

    this.audioElement.addEventListener("pause", () => {
      this.isPlaying = false;
      this.emit("onPause");
    });

    this.audioElement.addEventListener("ended", () => {
      this.isPlaying = false;
      this.emit("onEnd");
    });

    this.audioElement.addEventListener("error", (e) => {
      this.isPlaying = false;
      this.emit("onError", e);
    });

    this.audioElement.addEventListener("timeupdate", () => {
      if (this.audioElement) {
        // Null check
        this.emit("onTimeUpdate", {
          currentTime: this.audioElement.currentTime,
          duration: this.audioElement.duration,
        });
      }
    });
  }

  /**
   * Play audio from data URL or base64
   * @param {string} audioDataUrlOrBase64 - Data URL or base64 audio data
   * @param {Object} options - Additional options
   * @returns {Promise<void>}
   */
  async play(audioDataUrlOrBase64, options = {}) {
    try {
      this.init();

      if (!this.audioElement) {
        throw new Error("Audio element initialization failed");
      }

      // Stop current playback if any
      if (this.isPlaying) {
        this.stop();
      }

      // Handle different audio input formats
      let audioSource = audioDataUrlOrBase64;

      // If base64 without data URL prefix, add it
      if (audioDataUrlOrBase64.startsWith("data:audio/mpeg")) {
        audioSource = audioDataUrlOrBase64;
      } else if (!audioDataUrlOrBase64.startsWith("data:")) {
        audioSource = `data:audio/mpeg;base64,${audioDataUrlOrBase64}`;
      }

      this.audioElement.src = audioSource;
      this.audioElement.volume =
        options.volume !== undefined ? options.volume : 1.0;

      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        await playPromise;
      }

      return new Promise((resolve) => {
        const onEnd = () => {
          this.audioElement?.removeEventListener("ended", onEnd);
          resolve();
        };
        this.audioElement?.addEventListener("ended", onEnd);
      });
    } catch (error) {
      console.error("Audio playback error:", error);
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
    try {
      const url = URL.createObjectURL(audioBlob);
      return this.playFromUrl(url, options);
    } catch (error) {
      console.error("Error playing blob:", error);
      this.emit("onError", error);
      throw error;
    }
  }

  /**
   * Play audio from URL
   * @param {string} url - Audio URL
   * @param {Object} options
   * @returns {Promise<void>}
   */
  async playFromUrl(url, options = {}) {
    try {
      this.init();

      if (!this.audioElement) {
        throw new Error("Audio element initialization failed");
      }

      if (this.isPlaying) {
        this.stop();
      }

      this.audioElement.src = url;
      this.audioElement.volume =
        options.volume !== undefined ? options.volume : 1.0;

      const playPromise = this.audioElement.play();

      if (playPromise !== undefined) {
        await playPromise;
      }

      return new Promise((resolve) => {
        const onEnd = () => {
          this.audioElement?.removeEventListener("ended", onEnd);
          // Clean up object URL
          if (url.startsWith("blob:")) {
            URL.revokeObjectURL(url);
          }
          resolve();
        };
        this.audioElement?.addEventListener("ended", onEnd);
      });
    } catch (error) {
      console.error("Error playing URL:", error);
      this.emit("onError", error);
      throw error;
    }
  }

  /**
   * Pause playback
   */
  pause() {
    if (this.audioElement) {
      this.audioElement.pause();
    }
  }

  /**
   * Stop playback and reset
   */
  stop() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.currentTime = 0;
    }
  }

  /**
   * Resume playback
   */
  resume() {
    if (this.audioElement) {
      this.audioElement.play();
    }
  }

  /**
   * Set volume (0.0 - 1.0)
   * @param {number} volume
   */
  setVolume(volume) {
    if (this.audioElement) {
      this.audioElement.volume = Math.max(0, Math.min(1, volume));
    }
  }

  /**
   * Get current volume
   * @returns {number}
   */
  getVolume() {
    return this.audioElement?.volume || 0;
  }

  /**
   * Set playback rate
   * @param {number} rate
   */
  setPlaybackRate(rate) {
    if (this.audioElement) {
      this.audioElement.playbackRate = Math.max(0.5, Math.min(2.0, rate));
    }
  }

  /**
   * Get current time
   * @returns {number}
   */
  getCurrentTime() {
    return this.audioElement?.currentTime || 0;
  }

  /**
   * Set current time
   * @param {number} time
   */
  setCurrentTime(time) {
    if (this.audioElement) {
      this.audioElement.currentTime = time;
    }
  }

  /**
   * Get duration
   * @returns {number}
   */
  getDuration() {
    return this.audioElement?.duration || 0;
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
   * Get audio element (for advanced use cases)
   * @returns {HTMLAudioElement}
   */
  getAudioElement() {
    this.init();
    return this.audioElement;
  }

  /**
   * Destroy player and cleanup resources
   */
  destroy() {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = "";
      this.audioElement = null;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }

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
 * @param {string} audioDataOrUrl - Audio data URL, base64, or URL
 * @param {Object} options
 * @returns {Promise<void>}
 */
export const playAudio = async (audioDataOrUrl, options = {}) => {
  const player = getAudioPlayer();

  if (audioDataOrUrl.startsWith("blob:") || audioDataOrUrl.startsWith("http")) {
    return player.playFromUrl(audioDataOrUrl, options);
  }

  return player.play(audioDataOrUrl, options);
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
  stopAudio,
  pauseAudio,
  resumeAudio,
};
