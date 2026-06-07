import { STTProviderType } from '../types';
import { DeepgramProvider } from '../providers/DeepgramProvider';
import { BrowserSTTProvider } from '../providers/BrowserSTTProvider';

export class STTFactory {
  static providerRegistry = {
    [STTProviderType.DEEPGRAM]: DeepgramProvider,
    [STTProviderType.BROWSER]: BrowserSTTProvider
  };

  static registerProvider(type, providerClass) {
    this.providerRegistry[type] = providerClass;
  }

  static create(type, config) {
    const ProviderClass = this.providerRegistry[type];
    if (!ProviderClass) {
      throw new Error(`STT provider "${type}" not registered`);
    }
    return new ProviderClass(config);
  }

  static getAvailableProviders() {
    return Object.keys(this.providerRegistry);
  }
}
