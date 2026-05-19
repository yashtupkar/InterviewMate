import { useEffect, useRef } from "react";
import * as faceapi from "@vladmandic/face-api";
import { useProctoring } from "../ProctoringProvider";

const FACE_API_MODEL_PATH = "https://cdn.jsdelivr.net/npm/@vladmandic/face-api@1.7.12/model";

const FaceTracker = () => {
  const { webcamVideoRef, logViolation, setFaceStatus, updateMetrics, showWarning, hideWarning } = useProctoring();
  const canvasRef = useRef(null);
  const detectionLoop = useRef(null);
  const modelsLoadedRef = useRef(false);
  const lastNoFaceTimeRef = useRef(0);
  const noFaceThresholdMs = 3000; // 3 seconds
  const warningShownRef = useRef({
    noFace: false,
    multipleFace: false,
  });

  useEffect(() => {
    const loadModels = async () => {
      try {
        if (modelsLoadedRef.current) return;
        
        console.log("[FaceTracker] Loading face-api models from:", FACE_API_MODEL_PATH);
        
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(FACE_API_MODEL_PATH),
        ]);
        
        console.log("[FaceTracker] Models loaded successfully");
        modelsLoadedRef.current = true;
        setFaceStatus("Face detection initialized");
      } catch (error) {
        console.error("[FaceTracker] Model loading failed:", error);
        setFaceStatus("Face detection failed to initialize");
        
        setTimeout(() => {
          loadModels();
        }, 3000);
      }
    };

    let isMounted = true;
    loadModels();

    const trackFace = async () => {
      const video = webcamVideoRef.current;
      
      if (!video || video.readyState < 2 || !modelsLoadedRef.current) {
        detectionLoop.current = requestAnimationFrame(trackFace);
        return;
      }

      try {
        const detections = await faceapi.detectAllFaces(
          video,
          new faceapi.TinyFaceDetectorOptions({
            inputSize: 320,
            scoreThreshold: 0.4,
          })
        );

        if (!isMounted) return;

        const now = Date.now();

        if (detections.length === 0) {
          if (lastNoFaceTimeRef.current === 0) {
            lastNoFaceTimeRef.current = now;
            setFaceStatus("No face detected");
          } else if (now - lastNoFaceTimeRef.current > noFaceThresholdMs) {
            logViolation("no-face", "No face detected for more than 3 seconds.");
            if (!warningShownRef.current.noFace) {
              showWarning("⚠️ No Face Detected", "Please ensure your face is visible in the camera.");
              warningShownRef.current.noFace = true;
            }
            lastNoFaceTimeRef.current = 0;
          }
        } else if (detections.length > 1) {
          setFaceStatus(`Multiple faces detected (${detections.length})`);
          logViolation("multiple-face", `${detections.length} faces detected. Only one person is allowed.`);
          if (!warningShownRef.current.multipleFace) {
            showWarning("⚠️ Multiple Faces Detected", "Only one person is allowed during the proctoring session.");
            warningShownRef.current.multipleFace = true;
          }
          lastNoFaceTimeRef.current = 0;
        } else {
          lastNoFaceTimeRef.current = 0;
          if (warningShownRef.current.noFace || warningShownRef.current.multipleFace) {
            hideWarning();
            warningShownRef.current.noFace = false;
            warningShownRef.current.multipleFace = false;
          }
          
          const box = detections[0].box;
          const videoWidth = video.videoWidth || video.clientWidth;
          const videoHeight = video.videoHeight || video.clientHeight;
          
          const visibility = Math.round((box.width * box.height) / (videoWidth * videoHeight) * 100);
          const visibilityPercent = Math.max(0, Math.min(100, visibility));
          
          let visibilityText = "Good face visibility";
          if (visibility < 25) {
            visibilityText = "Low visibility - face too small";
          } else if (visibility < 55) {
            visibilityText = "Partial face in frame";
          }
          
          setFaceStatus(`${visibilityText} (${visibilityPercent}%)`);
          updateMetrics(100, 100);
          
          if (
            box.x < 20 ||
            box.y < 20 ||
            box.x + box.width > videoWidth - 20 ||
            box.y + box.height > videoHeight - 20
          ) {
            logViolation("face-out-of-frame", "Face is moving out of the camera frame.");
          }
        }
      } catch (error) {
        console.error("[FaceTracker] Detection error:", error);
      }

      detectionLoop.current = setTimeout(trackFace, 1000);
    };

    detectionLoop.current = setTimeout(trackFace, 1000);

    return () => {
      isMounted = false;
      if (detectionLoop.current) {
        clearTimeout(detectionLoop.current);
        detectionLoop.current = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    };
  }, [webcamVideoRef, logViolation, setFaceStatus, updateMetrics, showWarning, hideWarning]);

  return <canvas ref={canvasRef} className="hidden" />;
};

export default FaceTracker;
