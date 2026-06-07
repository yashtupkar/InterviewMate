export const STTProviderType = {
  DEEPGRAM: 'deepgram',
  BROWSER: 'browser',
  GOOGLE: 'google',
  AZURE: 'azure',
  OPENAI: 'openai'
};

export class STTError extends Error {
  constructor(message, code, recoverable = true) {
    super(message);
    this.name = 'STTError';
    this.code = code;
    this.recoverable = recoverable;
  }
}
