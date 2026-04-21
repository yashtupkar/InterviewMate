import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth, useUser } from "@clerk/clerk-react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { FiMail, FiSend, FiUsers } from "react-icons/fi";
import DashboardSection from "./components/DashboardSection";
import HomeHeroSection from "./components/HomeHeroSection";
import MatchmakingModal from "./components/MatchmakingModal";
import PeerHubStyles from "./components/PeerHubStyles";
import TopNav from "./components/TopNav";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const defaultPreferences = {
  isPeerMatchingEnabled: false,
  allowDirectInvites: true,
  allowInstantMatch: false,
  genderIdentity: "prefer_not_to_say",
  preferredMatch: "any",
  targetRole: "",
  targetSkills: [],
  preferredLanguage: "English",
};

const MATCH_REVEAL_DELAY_MS = 4500;

const PeerInterviewHub = () => {
  const { getToken } = useAuth();
  const { user: currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const [preferences, setPreferences] = useState(defaultPreferences);
  const [skillsInput, setSkillsInput] = useState("");
  const [requestMessage, setRequestMessage] = useState("");
  const [discoverUsers, setDiscoverUsers] = useState([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [userSearch, setUserSearch] = useState("");
  const [sendingToUserId, setSendingToUserId] = useState("");
  const [incoming, setIncoming] = useState([]);
  const [outgoing, setOutgoing] = useState([]);
  const [queueStatus, setQueueStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [sendingRequest, setSendingRequest] = useState(false);
  const [queueBusy, setQueueBusy] = useState(false);
  const [showMatchmakingPopup, setShowMatchmakingPopup] = useState(false);
  const [startInterviewCountdown, setStartInterviewCountdown] = useState(10);
  const [matchedSessionId, setMatchedSessionId] = useState("");
  const [matchedUser, setMatchedUser] = useState(null);
  const [matchModalStatus, setMatchModalStatus] = useState("searching");
  const matchSearchStartedAtRef = useRef(0);
  const matchRevealTimerRef = useRef(null);

  const [activeRouletteAvatar, setActiveRouletteAvatar] = useState(null);

  useEffect(() => {
    if (!showMatchmakingPopup || matchModalStatus !== "searching") return;

    const rouletteAvatars = [
      ...discoverUsers.map((u) => u.avatar).filter(Boolean),
      currentUser?.imageUrl,
      matchedUser?.avatar,
    ].filter(Boolean);

    if (rouletteAvatars.length === 0) return;

    setActiveRouletteAvatar(
      rouletteAvatars[Math.floor(Math.random() * rouletteAvatars.length)],
    );

    let index = 0;
    const interval = setInterval(() => {
      setActiveRouletteAvatar(rouletteAvatars[index]);
      index = (index + 1) % rouletteAvatars.length;
    }, 150);

    return () => clearInterval(interval);
  }, [
    showMatchmakingPopup,
    matchModalStatus,
    discoverUsers,
    currentUser?.imageUrl,
    matchedUser?.avatar,
  ]);

  const authHeaders = useCallback(async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  }, [getToken]);

  const normalizeSkills = useCallback(
    (value) =>
      value
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
    [],
  );

  const toComparableId = useCallback((value) => {
    if (!value) return "";
    if (typeof value === "string") return value;
    if (typeof value === "number") return String(value);
    if (typeof value === "object") {
      return String(value._id || value.userId || value.clerkId || "");
    }
    return String(value);
  }, []);

  const resolveDiscoverUser = useCallback(
    (candidate) => {
      const candidateId = toComparableId(candidate);
      if (!candidateId) return null;

      return (
        discoverUsers.find(
          (u) =>
            toComparableId(u?._id) === candidateId ||
            toComparableId(u?.clerkId) === candidateId,
        ) || null
      );
    },
    [discoverUsers, toComparableId],
  );

  const getMatchedPeerFromSession = useCallback(
    (session, extraMyIds = []) => {
      if (!session) return null;

      const myIdSet = new Set(
        [currentUser?.id, currentUser?.publicMetadata?.mongoId, ...extraMyIds]
          .map((id) => toComparableId(id))
          .filter(Boolean),
      );

      const participants = Array.isArray(session.participants)
        ? session.participants
        : [];

      const nonSelfParticipant = participants.find((p) => {
        const pId = toComparableId(p);
        return pId && !myIdSet.has(pId);
      });

      const resolvableParticipant = participants.find((p) =>
        Boolean(resolveDiscoverUser(p)),
      );

      const sideCandidates = [session.requesterId, session.recipientId].filter(
        Boolean,
      );
      const nonSelfSideCandidate = sideCandidates.find((p) => {
        const pId = toComparableId(p);
        return pId && !myIdSet.has(pId);
      });

      return (
        resolveDiscoverUser(nonSelfParticipant) ||
        resolveDiscoverUser(resolvableParticipant) ||
        resolveDiscoverUser(nonSelfSideCandidate) ||
        nonSelfParticipant ||
        nonSelfSideCandidate ||
        null
      );
    },
    [
      currentUser?.id,
      currentUser?.publicMetadata?.mongoId,
      resolveDiscoverUser,
      toComparableId,
    ],
  );

  const isDifferentFromDefaults = useCallback((pref) => {
    if (!pref) return false;

    return (
      pref.isPeerMatchingEnabled !== defaultPreferences.isPeerMatchingEnabled ||
      pref.allowDirectInvites !== defaultPreferences.allowDirectInvites ||
      pref.allowInstantMatch !== defaultPreferences.allowInstantMatch ||
      pref.genderIdentity !== defaultPreferences.genderIdentity ||
      pref.preferredMatch !== defaultPreferences.preferredMatch ||
      (pref.targetRole || "") !== defaultPreferences.targetRole ||
      (pref.preferredLanguage || "English") !==
        defaultPreferences.preferredLanguage ||
      (Array.isArray(pref.targetSkills) ? pref.targetSkills.length : 0) > 0
    );
  }, []);

  const isAlreadyConfigured = useCallback(
    (pref) => {
      if (!pref) return false;

      const createdAt = pref.createdAt
        ? new Date(pref.createdAt).getTime()
        : null;
      const updatedAt = pref.updatedAt
        ? new Date(pref.updatedAt).getTime()
        : null;
      const wasUpdatedAfterCreate =
        Number.isFinite(createdAt) &&
        Number.isFinite(updatedAt) &&
        updatedAt - createdAt > 1000;

      return wasUpdatedAfterCreate || isDifferentFromDefaults(pref);
    },
    [isDifferentFromDefaults],
  );

  const beginMatchedTransition = useCallback(
    (sessionId, matchedWith = null) => {
      if (!sessionId) return;

      setMatchedSessionId(sessionId);
      setMatchedUser(matchedWith);
      setShowMatchmakingPopup(true);
      setMatchModalStatus("searching");

      if (!matchSearchStartedAtRef.current) {
        matchSearchStartedAtRef.current = Date.now();
      }

      const elapsed = Date.now() - matchSearchStartedAtRef.current;
      const delay = Math.max(1200, MATCH_REVEAL_DELAY_MS - elapsed);

      if (matchRevealTimerRef.current) {
        clearTimeout(matchRevealTimerRef.current);
      }

      matchRevealTimerRef.current = setTimeout(() => {
        setMatchModalStatus("matched");
        setStartInterviewCountdown(10);
        matchRevealTimerRef.current = null;
      }, delay);
    },
    [],
  );

  useEffect(() => {
    return () => {
      if (matchRevealTimerRef.current) {
        clearTimeout(matchRevealTimerRef.current);
      }
    };
  }, []);

  const hydrate = useCallback(async () => {
    setLoading(true);
    try {
      const headers = await authHeaders();
      const [prefRes, requestsRes, queueRes, usersRes] = await Promise.all([
        axios.get(`${backendUrl}/api/peer-interview/preferences`, { headers }),
        axios.get(`${backendUrl}/api/peer-interview/requests`, { headers }),
        axios.get(`${backendUrl}/api/peer-interview/queue/status`, { headers }),
        axios.get(`${backendUrl}/api/peer-interview/users`, { headers }),
      ]);

      const pref = prefRes.data?.preference || defaultPreferences;
      const configured = isAlreadyConfigured(pref);

      setPreferences(pref);
      setSkillsInput(
        Array.isArray(pref.targetSkills) ? pref.targetSkills.join(", ") : "",
      );
      setIncoming(requestsRes.data?.incoming || []);
      setOutgoing(requestsRes.data?.outgoing || []);
      setQueueStatus(queueRes.data?.queueEntry || null);
      setDiscoverUsers(usersRes.data?.users || []);
      setDiscoverLoading(false);
      setShowMatchmakingPopup(queueRes.data?.queueEntry?.status === "waiting");

      if (queueRes.data?.queueEntry?.status === "waiting") {
        if (!matchSearchStartedAtRef.current) {
          matchSearchStartedAtRef.current = Date.now();
        }
        setMatchModalStatus("searching");
      }
    } catch (error) {
      const message =
        error?.response?.data?.message || "Failed to load peer interview data";
      toast.error(message);
      setDiscoverLoading(false);
    } finally {
      setLoading(false);
    }
  }, [authHeaders, isAlreadyConfigured]);

  const pollQueue = useCallback(async () => {
    try {
      const headers = await authHeaders();
      const queueRes = await axios.get(
        `${backendUrl}/api/peer-interview/queue/status`,
        { headers },
      );

      const queueEntry = queueRes.data?.queueEntry || null;
      setQueueStatus(queueEntry);

      if (
        queueEntry?.status === "matched" &&
        queueEntry?.matchedSessionId?._id
      ) {
        const session = queueEntry.matchedSessionId;
        const match = getMatchedPeerFromSession(session, [queueEntry.userId]);
        beginMatchedTransition(session._id, match);
        return;
      }

      if (queueEntry?.status !== "waiting" && matchModalStatus !== "matched") {
        setShowMatchmakingPopup(false);
      }
    } catch (_) {
      // Silent polling failure.
    }
  }, [
    authHeaders,
    beginMatchedTransition,
    getMatchedPeerFromSession,
    matchModalStatus,
  ]);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (queueStatus?.status !== "waiting") return undefined;

    const timer = setInterval(() => {
      pollQueue();
    }, 4000);

    return () => clearInterval(timer);
  }, [queueStatus?.status, pollQueue]);

  useEffect(() => {
    if (
      matchModalStatus !== "matched" ||
      !matchedSessionId ||
      !showMatchmakingPopup
    ) {
      return undefined;
    }

    const timer = setInterval(() => {
      setStartInterviewCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowMatchmakingPopup(false);
          navigate(`/peer-interview/session/${matchedSessionId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchedSessionId, navigate, matchModalStatus, showMatchmakingPopup]);

  const onToggle = (field) => {
    setPreferences((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const savePreferences = async ({ showSuccessToast = true } = {}) => {
    setSavingPrefs(true);
    try {
      const headers = await authHeaders();
      const payload = {
        ...preferences,
        targetSkills: normalizeSkills(skillsInput),
      };
      const res = await axios.post(
        `${backendUrl}/api/peer-interview/preferences`,
        payload,
        { headers },
      );
      setPreferences(res.data.preference);
      if (showSuccessToast) {
        toast.success("Preferences saved");
      }
      return true;
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not save preferences";
      toast.error(message);
      return false;
    } finally {
      setSavingPrefs(false);
    }
  };

  const startMatchingWithPreferences = async () => {
    const isSaved = await savePreferences({ showSuccessToast: false });
    if (!isSaved) return;

    toast.success("Preferences saved. Starting matchmaking...");
    await joinQueue();
  };

  const sendDirectRequest = async (recipientUserId, recipientName = "") => {
    if (!recipientUserId) return;

    setSendingRequest(true);
    setSendingToUserId(String(recipientUserId));
    try {
      const headers = await authHeaders();
      await axios.post(
        `${backendUrl}/api/peer-interview/request`,
        {
          recipientUserId,
          message: requestMessage.trim(),
          mode: "direct",
          audioOnly: false,
        },
        { headers },
      );
      toast.success(
        recipientName
          ? `Invitation sent to ${recipientName}`
          : "Invitation sent",
      );
      setRequestMessage("");
      await hydrate();
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not send request";
      toast.error(message);
    } finally {
      setSendingRequest(false);
      setSendingToUserId("");
    }
  };

  const filteredDiscoverUsers = useMemo(() => {
    const query = userSearch.trim().toLowerCase();
    if (!query) return discoverUsers;

    return discoverUsers.filter((user) => {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`
        .trim()
        .toLowerCase();
      const email = String(user.email || "").toLowerCase();
      const targetRole = String(user.targetRole || "").toLowerCase();
      const skills = Array.isArray(user.targetSkills)
        ? user.targetSkills.join(" ").toLowerCase()
        : "";

      return (
        fullName.includes(query) ||
        email.includes(query) ||
        targetRole.includes(query) ||
        skills.includes(query)
      );
    });
  }, [discoverUsers, userSearch]);

  const respond = async (requestId, action) => {
    try {
      const headers = await authHeaders();
      const res = await axios.post(
        `${backendUrl}/api/peer-interview/request/${requestId}/respond`,
        { action },
        { headers },
      );

      toast.success(
        action === "accept"
          ? res.data?.message ||
              "Accepted. Waiting for sender to start the interview."
          : "Rejected",
      );
      await hydrate();
    } catch (error) {
      const message =
        error?.response?.data?.message || `Could not ${action} request`;
      toast.error(message);
    }
  };

  const startAcceptedInterview = async (requestId) => {
    try {
      const headers = await authHeaders();
      const res = await axios.post(
        `${backendUrl}/api/peer-interview/request/${requestId}/join`,
        {},
        { headers },
      );

      if (res.data?.session?._id) {
        toast.success("Starting interview...");
        navigate(`/peer-interview/session/${res.data.session._id}`);
        return;
      }

      toast.error("Could not start interview");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not start interview";
      toast.error(message);
    }
  };

  const joinQueue = async () => {
    setQueueBusy(true);
    matchSearchStartedAtRef.current = Date.now();
    setMatchModalStatus("searching");
    setShowMatchmakingPopup(true);

    try {
      const headers = await authHeaders();
      const res = await axios.post(
        `${backendUrl}/api/peer-interview/queue/join`,
        {
          audioOnly: false,
          targetRole: preferences.targetRole || "",
          targetSkills: normalizeSkills(skillsInput),
          preferredLanguage: preferences.preferredLanguage || "English",
        },
        { headers },
      );

      if (res.data?.matched && res.data?.session?._id) {
        const session = res.data.session;
        const match = getMatchedPeerFromSession(session, [res.data.userId]);
        beginMatchedTransition(session._id, match);
        return;
      }

      toast.success("Added to instant queue");
      await hydrate();
    } catch (error) {
      const message = error?.response?.data?.message || "Could not join queue";
      toast.error(message);
      setShowMatchmakingPopup(false);
    } finally {
      setQueueBusy(false);
    }
  };

  const leaveQueue = async () => {
    setQueueBusy(true);
    try {
      const headers = await authHeaders();
      await axios.post(
        `${backendUrl}/api/peer-interview/queue/leave`,
        {},
        { headers },
      );
      setShowMatchmakingPopup(false);
      setMatchModalStatus("searching");
      setMatchedSessionId("");
      matchSearchStartedAtRef.current = 0;
      if (matchRevealTimerRef.current) {
        clearTimeout(matchRevealTimerRef.current);
        matchRevealTimerRef.current = null;
      }
      await hydrate();
    } catch (error) {
      const message = error?.response?.data?.message || "Could not leave queue";
      toast.error(message);
    } finally {
      setQueueBusy(false);
    }
  };

  const isSessionJoinable = useCallback((session) => {
    if (!session) return false;
    return !["ended", "cancelled"].includes(session.status);
  }, []);

  const currentSection = useMemo(() => {
    const path = location.pathname;
    if (path.startsWith("/peer-interview/send-request")) {
      return "send-request";
    }
    if (path.startsWith("/peer-interview/notifications")) {
      return "notifications";
    }
    if (path.startsWith("/peer-interview/search")) {
      return "search";
    }
    return "home";
  }, [location.pathname]);

  const navItems = useMemo(
    () => [
      {
        key: "send-request",
        label: "Send Invitation",
        icon: FiSend,
        path: "/peer-interview/send-request",
      },
      {
        key: "notifications",
        label: "Notifications",
        icon: FiMail,
        path: "/peer-interview/notifications",
      },
      {
        key: "search",
        label: "Search",
        icon: FiUsers,
        path: "/peer-interview/search",
      },
    ],
    [],
  );

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 selection:bg-[#bef264]/30">
      <PeerHubStyles />

      <TopNav
        navigate={navigate}
        navItems={navItems}
        currentSection={currentSection}
        joinQueue={joinQueue}
        queueBusy={queueBusy}
      />

      <MatchmakingModal
        show={showMatchmakingPopup}
        matchModalStatus={matchModalStatus}
        activeRouletteAvatar={activeRouletteAvatar}
        preferences={preferences}
        leaveQueue={leaveQueue}
        currentUser={currentUser}
        matchedUser={matchedUser}
        startInterviewCountdown={startInterviewCountdown}
        matchedSessionId={matchedSessionId}
        navigate={navigate}
      />

      {currentSection === "home" ? (
        <HomeHeroSection
          navigate={navigate}
          preferences={preferences}
          setPreferences={setPreferences}
          skillsInput={skillsInput}
          setSkillsInput={setSkillsInput}
          onToggle={onToggle}
          onStartMatching={startMatchingWithPreferences}
          savingPrefs={savingPrefs}
          queueBusy={queueBusy}
        />
      ) : (
        <DashboardSection
          currentSection={currentSection}
          hydrate={hydrate}
          loading={loading}
          discoverLoading={discoverLoading}
          filteredDiscoverUsers={filteredDiscoverUsers}
          userSearch={userSearch}
          setUserSearch={setUserSearch}
          sendDirectRequest={sendDirectRequest}
          sendingRequest={sendingRequest}
          sendingToUserId={sendingToUserId}
          incoming={incoming}
          outgoing={outgoing}
          respond={respond}
          startAcceptedInterview={startAcceptedInterview}
          isSessionJoinable={isSessionJoinable}
          navigate={navigate}
          joinQueue={joinQueue}
          queueBusy={queueBusy}
        />
      )}
    </div>
  );
};

export default PeerInterviewHub;
