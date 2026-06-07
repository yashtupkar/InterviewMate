import { STTProviderType } from '../types';

export const sttConfig = {
  provider: STTProviderType.DEEPGRAM,
  fallbackProvider: STTProviderType.BROWSER,
  language: 'en-IN',
  interimResults: true,
  vadEnabled: true,
  autoReconnect: true,
  maxReconnectAttempts: 5,
  reconnectDelayMs: 1000,
  deepgram: {
    model: 'nova-3',
    encoding: 'linear16',
    sampleRate: 16000,
    channels: 1,
    smartFormat: true,
    utteranceEndMs: 1000,
    vadEvents: true
  },
  browser: {
    continuous: true,
    interimResults: true
  }
};
