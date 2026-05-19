import { useEffect, useRef } from "react";
import { FaceMesh } from "@mediapipe/face_mesh";
import { Camera } from "@mediapipe/camera_utils";
import { useProctoring } from "../ProctoringProvider";

const EyeTracker = () => {
  const { webcamVideoRef, logViolation, setEyeStatus, updateMetrics } = useProctoring();
  const cameraRef = useRef(null);
  const faceMeshRef = useRef(null);
  const lastAwayTime = useRef(null);
  const continuousAwayCount = useRef(0);

  useEffect(() => {
    if (!webcamVideoRef.current) {
      return undefined;
    }

    const video = webcamVideoRef.current;
    const faceMesh = new FaceMesh({
      locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
    });

    faceMesh.setOptions({
      maxNumFaces: 1,
      refineLandmarks: true,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    faceMesh.onResults((results) => {
      if (!results.multiFaceLandmarks || !results.multiFaceLandmarks[0]) {
        setEyeStatus("Waiting for face landmarks");
        return;
      }

      const landmarks = results.multiFaceLandmarks[0];
      const leftIris = landmarks[468];
      const rightIris = landmarks[473];
      const noseTip = landmarks[1];
      if (!leftIris || !rightIris || !noseTip) {
        setEyeStatus("Tracking eyes...");
        return;
      }

      const averageIrisX = (leftIris.x + rightIris.x) / 2 - 0.5;
      const averageIrisY = (leftIris.y + rightIris.y) / 2 - 0.5;
      const headRoll = landmarks[33].y - landmarks[263].y;

      const awayThreshold = 0.12;
      const downThreshold = 0.16;
      let direction = "center";

      if (averageIrisX < -awayThreshold) {
        direction = "left";
      } else if (averageIrisX > awayThreshold) {
        direction = "right";
      } else if (averageIrisY > downThreshold) {
        direction = "down";
      }

      const quality = Math.max(0, 100 - Math.abs(averageIrisX) * 250 - Math.abs(averageIrisY) * 120 - Math.abs(headRoll) * 80);
      const focusScore = Math.round(Math.min(100, Math.max(0, quality)));
      const attentionScore = Math.round(Math.min(100, Math.max(0, 90 + (0.5 - Math.abs(averageIrisX)) * 30)));
      setEyeStatus(`Looking ${direction}. Head tilt ${headRoll.toFixed(2)}.`);
      updateMetrics(focusScore, attentionScore);

      if (direction !== "center") {
        const now = Date.now();
        if (!lastAwayTime.current) lastAwayTime.current = now;
        if (now - lastAwayTime.current > 5000) {
          continuousAwayCount.current += 1;
          logViolation("suspicious-movement", `Long eye/head diversion detected: ${direction}.`, {
            direction,
            headRoll: headRoll.toFixed(2),
          });
          lastAwayTime.current = now;
        }
      } else {
        lastAwayTime.current = null;
      }

      if (continuousAwayCount.current >= 3) {
        logViolation("long-eye-diversion", "Candidate repeatedly looked away from the screen.");
        continuousAwayCount.current = 0;
      }
    });

    const camera = new Camera(video, {
      onFrame: async () => {
        if (video.readyState >= 2) {
          await faceMesh.send({ image: video });
        }
      },
      width: 640,
      height: 480,
    });
    camera.start();

    cameraRef.current = camera;
    faceMeshRef.current = faceMesh;

    return () => {
      faceMesh.close();
      camera.stop();
    };
  }, [webcamVideoRef, logViolation, setEyeStatus, updateMetrics]);

  return null;
};

export default EyeTracker;
