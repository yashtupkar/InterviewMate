import React, { useEffect, useRef, useState, useCallback } from "react";

const toCanonicalState = (agentVisualState) =>
  agentVisualState === "speaking" ? "speaking" : "idle";

const VIDEO_FADE_MS = 400;
const VIDEO_PROMOTION_MS = 450;
const STATE_SETTLE_MS = 300; // Settle time for a confirmed state change

const getVideosForState = (animations, canonicalState) => {
  if (!animations) return [];

  const keys =
    canonicalState === "speaking"
      ? ["speaking"]
      : ["idle", "thinking", "listening"];

  const srcs = [];
  const seen = new Set();

  keys.forEach((key) => {
    const val = animations[key];
    if (!val) return;

    const values = Array.isArray(val) ? val : [val];
    values.forEach((src) => {
      if (!src || seen.has(src)) return;
      seen.add(src);
      srcs.push(src);
    });
  });

  return srcs;
};

const pickRandom = (arr, exclude = null) => {
  if (!arr.length) return null;
  if (arr.length === 1) return arr[0];
  const candidates = arr.filter((v) => v !== exclude);
  const pool = candidates.length ? candidates : arr;
  return pool[Math.floor(Math.random() * pool.length)];
};

const VideoLayer = React.forwardRef(
  (
    { src, visible, zIndex, loop, objectPosition, onError, onPlaying, onEnded },
    ref,
  ) => (
    <video
      ref={ref}
      src={src}
      autoPlay
      loop={loop}
      playsInline
      muted
      preload="auto"
      onError={onError}
      onPlaying={onPlaying}
      onEnded={onEnded}
      className="absolute inset-0 w-full h-full object-cover"
      style={{
        objectPosition,
        opacity: visible ? 1 : 0,
        zIndex,
        transition: `opacity ${VIDEO_FADE_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
        willChange: "opacity",
        transform: "translateZ(0)",
        backfaceVisibility: "hidden",
      }}
    />
  ),
);
VideoLayer.displayName = "VideoLayer";

const useVideoStateMachine = ({ animations, canonicalState, enabled }) => {
  const failedSrcs = useRef(new Set());
  const transitionTimer = useRef(null);
  const settleTimer = useRef(null);

  const [state, setState] = useState({
    layerA: { src: "", visible: false, zIndex: 1, token: 0 },
    layerB: { src: "", visible: false, zIndex: 0, token: 0 },
    activeLayer: "A", // 'A' or 'B'
  });

  const currentSrcRef = useRef("");
  const pendingSrcRef = useRef("");
  const lastCanonicalStateRef = useRef("");
  const transitionTokenRef = useRef(0);

  const getNextSrc = useCallback(
    (state) => {
      if (!animations || !enabled) return null;
      const pool = getVideosForState(animations, state).filter(
        (s) => !failedSrcs.current.has(s),
      );
      if (pool.length) {
        return pickRandom(pool, currentSrcRef.current);
      }

      if (state !== "idle") {
        const idlePool = getVideosForState(animations, "idle").filter(
          (s) => !failedSrcs.current.has(s),
        );
        return idlePool.length
          ? pickRandom(idlePool, currentSrcRef.current)
          : null;
      }

      return null;
    },
    [animations, enabled],
  );

  const transitionTo = useCallback(
    (nextSrc) => {
      if (
        !nextSrc ||
        nextSrc === currentSrcRef.current ||
        nextSrc === pendingSrcRef.current
      ) {
        return;
      }

      clearTimeout(transitionTimer.current);
      pendingSrcRef.current = nextSrc;
      transitionTokenRef.current += 1;
      const token = transitionTokenRef.current;

      setState((prev) => {
        const isAActive = prev.activeLayer === "A";
        // If A is active, we load into B and vice versa
        if (isAActive) {
          return {
            ...prev,
            layerB: { src: nextSrc, visible: false, zIndex: 2, token },
          };
        } else {
          return {
            ...prev,
            layerA: { src: nextSrc, visible: false, zIndex: 2, token },
          };
        }
      });
    },
    [state.activeLayer],
  );

  const handlePlaying = useCallback((layer, src, token) => {
    if (src !== pendingSrcRef.current || token !== transitionTokenRef.current) {
      return;
    }

    // Start fading in the new layer
    setState((prev) => {
      if (layer === "A" && prev.layerA.token === token) {
        return { ...prev, layerA: { ...prev.layerA, visible: true } };
      }
      if (layer === "B" && prev.layerB.token === token) {
        return { ...prev, layerB: { ...prev.layerB, visible: true } };
      }
      return prev;
    });

    clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      if (
        src !== pendingSrcRef.current ||
        token !== transitionTokenRef.current
      ) {
        return;
      }

      currentSrcRef.current = src;
      pendingSrcRef.current = "";

      setState((prev) => {
        if (layer === "A") {
          return {
            activeLayer: "A",
            layerA: { ...prev.layerA, zIndex: 1 },
            layerB: { src: "", visible: false, zIndex: 0, token: 0 },
          };
        } else {
          return {
            activeLayer: "B",
            layerA: { src: "", visible: false, zIndex: 0, token: 0 },
            layerB: { ...prev.layerB, zIndex: 1 },
          };
        }
      });
    }, VIDEO_PROMOTION_MS);
  }, []);

  const handleEnded = useCallback(() => {
    // When a video ends, if we're still in the same state, pick a new one
    // Only rotate if there's more than one video available for the current state
    const pool = getVideosForState(animations, canonicalState);
    if (pool.length > 1) {
      const nextSrc = getNextSrc(canonicalState);
      if (nextSrc) {
        transitionTo(nextSrc);
      }
    }
  }, [animations, canonicalState, getNextSrc, transitionTo]);

  useEffect(() => {
    clearTimeout(settleTimer.current);

    if (!enabled || !animations) {
      clearTimeout(transitionTimer.current);
      pendingSrcRef.current = "";
      transitionTokenRef.current = 0;
      currentSrcRef.current = "";
      lastCanonicalStateRef.current = "";
      setState({
        layerA: { src: "", visible: false, zIndex: 1, token: 0 },
        layerB: { src: "", visible: false, zIndex: 0, token: 0 },
        activeLayer: "A",
      });
      return;
    }

    // Only proceed if the state has changed
    if (
      canonicalState === lastCanonicalStateRef.current &&
      currentSrcRef.current
    ) {
      return;
    }

    const nextSrc = getNextSrc(canonicalState);
    if (!nextSrc) return;

    if (!currentSrcRef.current) {
      // Initial load
      currentSrcRef.current = nextSrc;
      pendingSrcRef.current = "";
      lastCanonicalStateRef.current = canonicalState;
      transitionTokenRef.current = 0;
      setState({
        layerA: { src: nextSrc, visible: true, zIndex: 1, token: 0 },
        layerB: { src: "", visible: false, zIndex: 0, token: 0 },
        activeLayer: "A",
      });
    } else {
      // Trigger settle timer for state change
      settleTimer.current = setTimeout(() => {
        const settledNextSrc = getNextSrc(canonicalState);
        if (settledNextSrc && settledNextSrc !== currentSrcRef.current) {
          lastCanonicalStateRef.current = canonicalState;
          transitionTo(settledNextSrc);
        }
      }, STATE_SETTLE_MS);
    }
  }, [animations, canonicalState, enabled, getNextSrc, transitionTo]);

  useEffect(
    () => () => {
      clearTimeout(transitionTimer.current);
      clearTimeout(settleTimer.current);
    },
    [],
  );

  const handleError = useCallback((layer, src) => {
    if (!src) return;
    failedSrcs.current.add(src);
    if (src === pendingSrcRef.current) {
      pendingSrcRef.current = "";
      transitionTokenRef.current = 0;
      clearTimeout(transitionTimer.current);
    }

    setState((prev) => {
      if (layer === "A" && prev.layerA.src === src) {
        return {
          ...prev,
          layerA: { src: "", visible: false, zIndex: 0, token: 0 },
        };
      }
      if (layer === "B" && prev.layerB.src === src) {
        return {
          ...prev,
          layerB: { src: "", visible: false, zIndex: 0, token: 0 },
        };
      }
      return prev;
    });
  }, []);

  return { state, handlePlaying, handleEnded, handleError };
};

const AgentLoopedVideoAvatar = ({
  animations,
  fallbackImageSrc,
  fallbackImageAlt,
  agentVisualState,
  enabled,
  objectPosition = "50% 28%",
}) => {
  const canonicalState = toCanonicalState(agentVisualState);

  const { state, handlePlaying, handleEnded, handleError } =
    useVideoStateMachine({
      animations,
      canonicalState,
      enabled,
    });

  const { layerA, layerB } = state;
  const hasVideo = Boolean(layerA.src || layerB.src);

  // We only loop idle videos if that's the only one, but generally we want rotation
  // for speaking to feel natural. For simplicity, we loop if only 1 video exists.
  const poolSize = getVideosForState(animations, canonicalState).length;
  const shouldLoop = poolSize <= 1;

  return (
    <>
      <img
        src={fallbackImageSrc}
        alt={fallbackImageAlt}
        className="absolute inset-0 w-full h-full object-cover"
        style={{
          objectPosition,
          opacity: hasVideo ? 0 : 1,
          transition: "opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)",
          willChange: "opacity",
          transform: "translateZ(0)",
        }}
      />

      {layerA.src && (
        <VideoLayer
          src={layerA.src}
          visible={layerA.visible}
          zIndex={layerA.zIndex}
          loop={shouldLoop}
          objectPosition={objectPosition}
          onPlaying={() => handlePlaying("A", layerA.src, layerA.token)}
          onEnded={handleEnded}
          onError={() => handleError("A", layerA.src)}
        />
      )}

      {layerB.src && (
        <VideoLayer
          src={layerB.src}
          visible={layerB.visible}
          zIndex={layerB.zIndex}
          loop={shouldLoop}
          objectPosition={objectPosition}
          onPlaying={() => handlePlaying("B", layerB.src, layerB.token)}
          onEnded={handleEnded}
          onError={() => handleError("B", layerB.src)}
        />
      )}
    </>
  );
};

export default AgentLoopedVideoAvatar;
