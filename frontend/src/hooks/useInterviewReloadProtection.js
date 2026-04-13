import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const LOCK_STORAGE_KEY = "interview_locked_sessions";

const readLockedSessions = () => {
  try {
    const rawValue = window.localStorage.getItem(LOCK_STORAGE_KEY);
    const parsed = rawValue ? JSON.parse(rawValue) : [];
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch (error) {
    return [];
  }
};

const writeLockedSessions = (sessionIds) => {
  try {
    window.localStorage.setItem(
      LOCK_STORAGE_KEY,
      JSON.stringify([...new Set(sessionIds.filter(Boolean))]),
    );
  } catch (error) {
    // Ignore storage failures.
  }
};

const useInterviewReloadProtection = ({
  sessionId,
  isSessionRunning,
  hasInterviewEnded,
  isPreview = false,
  enableInPreview = false,
  resultPath,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [showReloadPrompt, setShowReloadPrompt] = useState(false);
  const allowReloadRef = useRef(false);
  const isGuardDisabled = isPreview && !enableInPreview;

  const isSessionLocked = useMemo(() => {
    if (!sessionId || isGuardDisabled) return false;
    return readLockedSessions().includes(sessionId);
  }, [sessionId, isGuardDisabled]);

  const lockSession = () => {
    if (!sessionId || isGuardDisabled) return;
    const lockedSessions = readLockedSessions();
    if (!lockedSessions.includes(sessionId)) {
      writeLockedSessions([...lockedSessions, sessionId]);
    }
  };

  const forceReload = () => {
    allowReloadRef.current = true;
    window.location.reload();
  };

  useEffect(() => {
    if (!sessionId || isGuardDisabled) return;
    if (hasInterviewEnded) {
      lockSession();
    }
  }, [sessionId, hasInterviewEnded, isGuardDisabled]);

  useEffect(() => {
    if (!sessionId || isGuardDisabled || !isSessionLocked) return;
    if (location.pathname.includes("/session")) {
      navigate(resultPath, { replace: true });
    }
  }, [sessionId, isGuardDisabled, isSessionLocked, location.pathname, navigate, resultPath]);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (isGuardDisabled || !isSessionRunning || allowReloadRef.current) return;
      event.preventDefault();
      event.returnValue = "";
      return "";
    };

    const handleKeyDown = (event) => {
      const isReloadShortcut =
        event.key === "F5" ||
        ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "r");

      if (!isReloadShortcut || isGuardDisabled || !isSessionRunning) return;

      event.preventDefault();
      setShowReloadPrompt(true);
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isGuardDisabled, isSessionRunning]);

  const confirmReload = () => {
    setShowReloadPrompt(false);
    forceReload();
  };

  const cancelReload = () => {
    setShowReloadPrompt(false);
  };

  return {
    showReloadPrompt,
    confirmReload,
    cancelReload,
    forceReload,
    lockSession,
    isSessionLocked,
  };
};

export default useInterviewReloadProtection;