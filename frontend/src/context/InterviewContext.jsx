import React, { createContext, useContext, useState, useRef } from "react";

const InterviewContext = createContext();

const getStoredBoolean = (key, defaultValue) => {
  const stored = localStorage.getItem(key);

  if (stored === null) {
    return defaultValue;
  }

  try {
    const parsed = JSON.parse(stored);
    return typeof parsed === "boolean" ? parsed : defaultValue;
  } catch {
    return defaultValue;
  }
};

export const InterviewProvider = ({ children }) => {
  const [interviewData, setInterviewData] = useState({
    interviewType: "technical",
    role: "",
    level: "Junior",
    content: "",
    agentName: "",
    agentVoiceProvider: "",
    agentVoiceId: "",
  });
  const [sessionId, setSessionId] = useState(null);
  const [transcript, setTranscript] = useState([]);
  const [report, setReport] = useState(null);
  const [callStatus, setCallStatus] = useState("inactive"); // inactive, connecting, active
  const [interviewDuration, setInterviewDuration] = useState(0);

  // Camera and Mic states with localStorage persistence
  const [isCameraEnabled, setIsCameraEnabled] = useState(() =>
    getStoredBoolean("interview_camera_enabled", true),
  );
  const [isMicEnabled, setIsMicEnabled] = useState(() =>
    getStoredBoolean("interview_mic_enabled", true),
  );

  const setAndStoreCameraStatus = (status) => {
    setIsCameraEnabled(status);
    localStorage.setItem("interview_camera_enabled", JSON.stringify(status));
  };

  const setAndStoreMicStatus = (status) => {
    setIsMicEnabled(status);
    localStorage.setItem("interview_mic_enabled", JSON.stringify(status));
  };

  const resetInterview = () => {
    setSessionId(null);
    setTranscript([]);
    setReport(null);
    setCallStatus("inactive");
    setInterviewDuration(0);
  };

  return (
    <InterviewContext.Provider
      value={{
        interviewData,
        setInterviewData,
        sessionId,
        setSessionId,
        transcript,
        setTranscript,
        report,
        setReport,
        callStatus,
        setCallStatus,
        interviewDuration,
        setInterviewDuration,
        isCameraEnabled,
        setIsCameraEnabled: setAndStoreCameraStatus,
        isMicEnabled,
        setIsMicEnabled: setAndStoreMicStatus,
        resetInterview,
      }}
    >
      {children}
    </InterviewContext.Provider>
  );
};

export const useInterview = () => {
  const context = useContext(InterviewContext);
  if (!context) {
    throw new Error("useInterview must be used within an InterviewProvider");
  }
  return context;
};
