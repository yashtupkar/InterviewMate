export class ISTTProvider {
  constructor(config) {
    if (this.constructor === ISTTProvider) {
      throw new Error("Cannot instantiate abstract class ISTTProvider");
    }
    this.config = config;
    this._isInitialized = false;
    this._isListening = false;
    this._isPaused = false;
    this._isMuted = false;
    this._eventHandlers = {
      onInterimTranscript: null,
      onFinalTranscript: null,
      onSpeechStart: null,
      onSpeechEnd: null,
      onError: null,
      onVolumeChange: null,
    };
  }

  setMuted(value) {
    this._isMuted = value;
  }

  async initialize() {
    throw new Error("initialize() must be implemented");
  }

  async start() {
    throw new Error("start() must be implemented");
  }

  async stop() {
    throw new Error("stop() must be implemented");
  }

  async pause() {
    throw new Error("pause() must be implemented");
  }

  async resume() {
    throw new Error("resume() must be implemented");
  }

  async destroy() {
    throw new Error("destroy() must be implemented");
  }

  onInterimTranscript(callback) {
    this._eventHandlers.onInterimTranscript = callback;
  }

  onFinalTranscript(callback) {
    this._eventHandlers.onFinalTranscript = callback;
  }

  onSpeechStart(callback) {
    this._eventHandlers.onSpeechStart = callback;
  }

  onSpeechEnd(callback) {
    this._eventHandlers.onSpeechEnd = callback;
  }

  onError(callback) {
    this._eventHandlers.onError = callback;
  }

  onVolumeChange(callback) {
    this._eventHandlers.onVolumeChange = callback;
  }

  _emit(event, data) {
    const handler = this._eventHandlers[event];
    if (handler) {
      try {
        handler(data);
      } catch (e) {
        console.error(`[STT:Provider] Error in ${event} handler:`, e);
      }
    }
  }

  isInitialized() {
    return this._isInitialized;
  }

  isListening() {
    return this._isListening;
  }

  isPaused() {
    return this._isPaused;
  }
}
