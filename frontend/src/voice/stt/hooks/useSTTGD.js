import { useState, useEffect, useRef, useCallback } from "react";
import { STTFactory } from "../factories/STTFactory";
import { sttConfig } from "../config";
import { STTProviderType } from "../types";
import { BrowserSTTProvider } from "../providers/BrowserSTTProvider";

export function useSTTGD(config = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(
    config.provider || sttConfig.provider,
  );
  
  const [isMuted, setIsMutedState] = useState(false);
  const isMutedRef = useRef(false);

  const providerRef = useRef(null);
  const cleanupRef = useRef(null);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const setMuted = useCallback((value) => {
    setIsMutedState(value);
    isMutedRef.current = value;
    providerRef.current?.setMuted?.(value);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMutedRef.current;
    setMuted(next);
  }, [setMuted]);

  const getProvider = useCallback(
    async (type = currentProvider) => {
      if (providerRef.current) {
        await providerRef.current.destroy();
      }

      const fullConfig = { ...sttConfig, ...config, provider: type };
      const provider = STTFactory.create(type, fullConfig);
      providerRef.current = provider;

      // Keep provider's internal mute state in sync
      provider.setMuted?.(isMutedRef.current);

      provider.onInterimTranscript((text) => {
        if (!isMutedRef.current) {
          setInterimTranscript(text);
          configRef.current.onTranscript?.({
            transcript: text,
            isFinal: false,
            confidence: 1,
          });
        }
      });

      provider.onFinalTranscript(({ transcript, confidence }) => {
        if (!isMutedRef.current) {
          setFinalTranscript((prev) => `${prev} ${transcript}`.trim());
          setInterimTranscript("");
          configRef.current.onTranscript?.({
            transcript,
            isFinal: true,
            confidence: confidence || 1,
          });
        }
      });

      provider.onSpeechStart(() => {
        if (!isMutedRef.current) {
          configRef.current.onSpeechStart?.();
        }
      });

      provider.onSpeechEnd(() => {
        if (!isMutedRef.current) {
          configRef.current.onSpeechEnd?.();
        }
      });

      provider.onVolumeChange((vol) => {
        if (!isMutedRef.current) {
          setVolume(vol);
        } else {
          setVolume(0);
        }
      });

      provider.onError((err) => {
        setError(err);
        if (err.recoverable && fullConfig.fallbackProvider) {
          handleFailover(fullConfig.fallbackProvider);
        }
      });

      return provider;
    },
    [currentProvider, config],
  );

  const handleFailover = useCallback(async (fallbackProvider) => {
    console.log("[STT:GD] Failing over to:", fallbackProvider);
    if (providerRef.current) {
      await providerRef.current.destroy();
    }
    if (
      fallbackProvider === STTProviderType.BROWSER &&
      !BrowserSTTProvider.isSupported()
    ) {
      console.warn("[STT:GD] Browser STT not supported, no fallback available");
      return;
    }
    setCurrentProvider(fallbackProvider);
  }, []);

  const start = useCallback(
    async (dynamicKeywords = []) => {
      setError(null);
      setMuted(false);
      try {
        const provider = await getProvider();
        await provider.initialize();
        await provider.start(dynamicKeywords);
        setIsListening(true);
      } catch (err) {
        setError(err);
      }
    },
    [getProvider, setMuted],
  );

  const stop = useCallback(async () => {
    setIsListening(false);
    setIsPaused(false);
    if (providerRef.current) {
      await providerRef.current.stop();
    }
  }, []);

  const pause = useCallback(async () => {
    setIsPaused(true);
    if (providerRef.current) {
      await providerRef.current.pause();
    }
  }, []);

  const resume = useCallback(async () => {
    setIsPaused(false);
    if (providerRef.current) {
      await providerRef.current.resume();
    }
  }, []);

  const clearTranscript = useCallback(() => {
    setFinalTranscript("");
    setInterimTranscript("");
  }, []);

  const switchProvider = useCallback(
    async (newProvider) => {
      const wasListening = isListening;
      await stop();
      setCurrentProvider(newProvider);
      if (wasListening) {
        await start();
      }
    },
    [isListening, stop, start],
  );

  useEffect(() => {
    cleanupRef.current = async () => {
      if (providerRef.current) {
        await providerRef.current.destroy();
      }
    };

    return () => {
      cleanupRef.current?.();
    };
  }, []);

  const liveText = `${finalTranscript} ${interimTranscript}`.trim();

  return {
    transcript: finalTranscript,
    interimTranscript,
    liveText,
    isListening,
    isPaused,
    isMuted,
    volume,
    error,
    currentProvider,
    start,
    stop,
    pause,
    resume,
    toggleMute,
    clearTranscript,
    switchProvider,
    setMuted,
  };
}
