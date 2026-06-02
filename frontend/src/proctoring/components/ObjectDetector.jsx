import { useEffect, useRef } from "react";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import { useProctoring } from "../ProctoringProvider";

const ObjectDetector = () => {
  const { webcamVideoRef, logViolation, showWarning, hideWarning } =
    useProctoring();
  const modelRef = useRef(null);
  const detectionLoop = useRef(null);
  const modelLoadedRef = useRef(false);
  const warningShownRef = useRef({
    phone: false,
    book: false,
  });

  useEffect(() => {
    const loadModel = async () => {
      try {
        if (modelLoadedRef.current) return;
        console.log("[ObjectDetector] Loading COCO-SSD model...");
        modelRef.current = await cocoSsd.load({ base: "mobilenet_v2" });
        console.log("[ObjectDetector] COCO-SSD model loaded successfully");
        modelLoadedRef.current = true;
      } catch (error) {
        console.error("[ObjectDetector] Model loading failed:", error);
        setTimeout(loadModel, 5000);
      }
    };

    let isMounted = true;
    loadModel();

    const detectObjects = async () => {
      const video = webcamVideoRef.current;
      if (!video || video.readyState < 2 || !modelLoadedRef.current) {
        detectionLoop.current = requestAnimationFrame(detectObjects);
        return;
      }

      try {
        const predictions = await modelRef.current.detect(video);

        if (!isMounted) return;

        const detectedPhone = predictions.some(
          (pred) =>
            pred.class.toLowerCase() === "cell phone" && pred.score > 0.4,
        );
        const detectedBook = predictions.some(
          (pred) => pred.class.toLowerCase() === "book" && pred.score > 0.4,
        );

        if (detectedPhone) {
          if (!warningShownRef.current.phone) {
            showWarning("⚠️ Phone Detected", "Please put away your phone.");
            warningShownRef.current.phone = true;
          }
          logViolation("phone-detected", "Phone detected in frame.");
        } else {
          if (warningShownRef.current.phone) {
            warningShownRef.current.phone = false;
            if (!warningShownRef.current.book) {
              hideWarning();
            }
          }
        }

        if (detectedBook) {
          if (!warningShownRef.current.book) {
            showWarning(
              "⚠️ Book Detected",
              "Please put away any books or notes.",
            );
            warningShownRef.current.book = true;
          }
          logViolation("book-detected", "Book detected in frame.");
        } else {
          if (warningShownRef.current.book) {
            warningShownRef.current.book = false;
            if (!warningShownRef.current.phone) {
              hideWarning();
            }
          }
        }
      } catch (error) {
        console.error("[ObjectDetector] Detection error:", error);
      }

      detectionLoop.current = setTimeout(detectObjects, 2000);
    };

    detectionLoop.current = setTimeout(detectObjects, 1500);

    return () => {
      isMounted = false;
      if (detectionLoop.current) {
        clearTimeout(detectionLoop.current);
        detectionLoop.current = null;
      }
    };
  }, [webcamVideoRef, logViolation, showWarning, hideWarning]);

  return null;
};

export default ObjectDetector;

