import { useEffect, useRef, useCallback, useState } from "react";

/**
 * Hook for capturing frames from video element at regular intervals
 * Used to send frames to backend for cheat detection
 */
export const useFrameCapture = (
  videoElement,
  intervalMs = 500,
  enabled = true,
) => {
  const canvasRef = useRef(null);
  const captureIntervalRef = useRef(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [frameCount, setFrameCount] = useState(0);

  const captureFrame = useCallback(() => {
    if (!videoElement || !canvasRef.current) return null;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return null;

      // Set canvas dimensions to match video
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;

      // Draw current video frame to canvas
      ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

      // Get frame as base64 data URL
      const frameData = canvas.toDataURL("image/jpeg", 0.8);
      return frameData;
    } catch (error) {
      console.error("Error capturing frame:", error);
      return null;
    }
  }, [videoElement]);

  const startCapturing = useCallback(() => {
    if (captureIntervalRef.current) return; // Already capturing

    setIsCapturing(true);
    let count = 0;

    captureIntervalRef.current = setInterval(() => {
      const frame = captureFrame();
      if (frame) {
        count++;
        setFrameCount(count);
        // Dispatch custom event that can be listened to
        window.dispatchEvent(
          new CustomEvent("frameCapture", {
            detail: {
              frame,
              frameIndex: count,
              timestamp: new Date(),
            },
          }),
        );
      }
    }, intervalMs);
  }, [captureFrame, intervalMs]);

  const stopCapturing = useCallback(() => {
    if (captureIntervalRef.current) {
      clearInterval(captureIntervalRef.current);
      captureIntervalRef.current = null;
      setIsCapturing(false);
      setFrameCount(0);
    }
  }, []);

  // Auto-start/stop based on enabled prop
  useEffect(() => {
    if (enabled && videoElement) {
      startCapturing();
    } else {
      stopCapturing();
    }

    return () => {
      stopCapturing();
    };
  }, [enabled, videoElement, startCapturing, stopCapturing]);

  return {
    isCapturing,
    frameCount,
    captureFrame,
    startCapturing,
    stopCapturing,
    canvasRef,
  };
};

/**
 * Hook for sending captured frames to backend for detection
 */
export const useFrameStreaming = (
  sessionId,
  userId,
  backendUrl,
  enabled = true,
) => {
  const [isStreaming, setIsStreaming] = useState(false);
  const [detections, setDetections] = useState([]);
  const [error, setError] = useState(null);
  const frameQueueRef = useRef([]);
  const processingRef = useRef(false);

  const sendFrame = useCallback(
    async (frameData, frameIndex) => {
      if (!enabled || !sessionId || !userId) return;

      try {
        frameQueueRef.current.push({
          frameData,
          frameIndex,
          timestamp: new Date(),
        });

        // Process queue if not already processing
        if (!processingRef.current && frameQueueRef.current.length > 0) {
          processingRef.current = true;

          const frame = frameQueueRef.current.shift();

          const response = await fetch(
            `${backendUrl}/api/cheat/detect-stream`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                frameData: frame.frameData,
                sessionId,
                userId,
                frameIndex: frame.frameIndex,
              }),
            },
          );

          if (!response.ok) {
            throw new Error(`Detection failed: ${response.statusText}`);
          }

          const result = await response.json();

          if (result.success) {
            setDetections((prev) => [
              ...prev.slice(-99),
              result.detectionResult,
            ]);
            setError(null);
          }

          processingRef.current = false;
        }
      } catch (err) {
        console.error("Frame streaming error:", err);
        setError(err.message);
        processingRef.current = false;
      }
    },
    [sessionId, userId, backendUrl, enabled],
  );

  const startStreaming = useCallback(() => {
    setIsStreaming(true);
    setError(null);
  }, []);

  const stopStreaming = useCallback(() => {
    setIsStreaming(false);
    frameQueueRef.current = [];
  }, []);

  // Listen for frame capture events
  useEffect(() => {
    if (!isStreaming) return;

    const handleFrameCapture = (event) => {
      const { frame, frameIndex } = event.detail;
      sendFrame(frame, frameIndex);
    };

    window.addEventListener("frameCapture", handleFrameCapture);

    return () => {
      window.removeEventListener("frameCapture", handleFrameCapture);
    };
  }, [isStreaming, sendFrame]);

  return {
    isStreaming,
    detections,
    error,
    startStreaming,
    stopStreaming,
    queueLength: frameQueueRef.current.length,
  };
};
