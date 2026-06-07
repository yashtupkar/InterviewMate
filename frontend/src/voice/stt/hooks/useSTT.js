import { useState, useEffect, useRef, useCallback } from "react";
import { STTFactory } from "../factories/STTFactory";
import { sttConfig } from "../config";
import { STTProviderType } from "../types";
import { BrowserSTTProvider } from "../providers/BrowserSTTProvider";

export function useSTT(config = {}) {
  const [isListening, setIsListening] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [finalTranscript, setFinalTranscript] = useState("");
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState(null);
  const [currentProvider, setCurrentProvider] = useState(
    config.provider || sttConfig.provider,
  );
  const [isMuted, setIsMuted] = useState(false);

  const providerRef = useRef(null);
  const cleanupRef = useRef(null);
  const configRef = useRef(config);

  useEffect(() => {
    configRef.current = config;
  }, [config]);

  const getProvider = useCallback(
    async (type = currentProvider) => {
      if (providerRef.current) {
        await providerRef.current.destroy();
      }

      const fullConfig = { ...sttConfig, ...config, provider: type };
      const provider = STTFactory.create(type, fullConfig);
      providerRef.current = provider;

      provider.onInterimTranscript((text) => {
        if (!isMuted) {
          setInterimTranscript(text);
          configRef.current.onTranscript?.({
            transcript: text,
            isFinal: false,
            confidence: 1,
          });
        }
      });
      provider.onFinalTranscript(({ transcript, confidence }) => {
        if (!isMuted) {
          setFinalTranscript((prev) => `${prev} ${transcript}`.trim());
          setInterimTranscript("");
          configRef.current.onTranscript?.({
            transcript,
            isFinal: true,
            confidence: confidence || 1,
          });
        }
      });
      provider.onSpeechStart(() => configRef.current.onSpeechStart?.());
      provider.onSpeechEnd(() => configRef.current.onSpeechEnd?.());
      provider.onVolumeChange((vol) => setVolume(vol));
      provider.onError((err) => {
        setError(err);
        if (err.recoverable && fullConfig.fallbackProvider) {
          handleFailover(fullConfig.fallbackProvider);
        }
      });

      return provider;
    },
    [currentProvider, config, isMuted],
  );

  const handleFailover = useCallback(async (fallbackProvider) => {
    console.log("[STT] Failing over to:", fallbackProvider);
    if (providerRef.current) {
      await providerRef.current.destroy();
    }
    if (
      fallbackProvider === STTProviderType.BROWSER &&
      !BrowserSTTProvider.isSupported()
    ) {
      console.warn("[STT] Browser STT not supported, no fallback available");
      return;
    }
    setCurrentProvider(fallbackProvider);
  }, []);

  const start = useCallback(
    async (dynamicKeywords = []) => {
      setError(null);
      setIsMuted(false);
      try {
        const provider = await getProvider();
        await provider.initialize();
        await provider.start(dynamicKeywords);
        setIsListening(true);
      } catch (err) {
        setError(err);
      }
    },
    [getProvider],
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

  const setMuted = useCallback((value) => {
    setIsMuted(value);
    providerRef.current?.setMuted?.(value);
  }, []);

  const toggleMute = useCallback(() => {
    const next = !isMuted;
    setIsMuted(next);
    providerRef.current?.setMuted?.(next);
  }, [isMuted]);

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
