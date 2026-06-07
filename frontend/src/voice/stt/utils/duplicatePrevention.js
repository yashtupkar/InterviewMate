export class TranscriptDeduplicator {
  constructor(maxHistorySize = 10) {
    this.transcriptHistory = [];
    this.maxHistorySize = maxHistorySize;
    this.lastFinalTranscript = '';
    this.lastInterimTranscript = '';
  }

  isDuplicate(text, isFinal) {
    if (!text || !text.trim()) return false;

    const normalizedText = this._normalizeText(text);

    if (isFinal) {
      if (normalizedText === this._normalizeText(this.lastFinalTranscript)) {
        return true;
      }
      this.lastFinalTranscript = text;
      this.lastInterimTranscript = '';
    } else {
      if (normalizedText === this._normalizeText(this.lastInterimTranscript)) {
        return true;
      }
      if (this.lastFinalTranscript && normalizedText.includes(this._normalizeText(this.lastFinalTranscript))) {
        return true;
      }
      this.lastInterimTranscript = text;
    }

    for (const entry of this.transcriptHistory) {
      if (normalizedText === this._normalizeText(entry.text) && isFinal === entry.isFinal) {
        return true;
      }
    }

    this.transcriptHistory.push({ text, isFinal, timestamp: Date.now() });
    if (this.transcriptHistory.length > this.maxHistorySize) {
      this.transcriptHistory.shift();
    }

    return false;
  }

  _normalizeText(text) {
    return text
      .trim()
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '');
  }

  clear() {
    this.transcriptHistory = [];
    this.lastFinalTranscript = '';
    this.lastInterimTranscript = '';
  }
}
