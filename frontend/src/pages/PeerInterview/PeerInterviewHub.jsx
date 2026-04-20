import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import {
  FiClock,
  FiEdit2,
  FiMail,
  FiRefreshCw,
  FiSend,
  FiSettings,
  FiUser,
  FiUserCheck,
  FiUsers,
  FiXCircle,
} from "react-icons/fi";

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

const statusColor = {
  pending: "text-amber-300 border-amber-400/30 bg-amber-500/10",
  accepted: "text-emerald-300 border-emerald-400/30 bg-emerald-500/10",
  accepted_waiting_sender: "text-cyan-300 border-cyan-400/30 bg-cyan-500/10",
  rejected: "text-rose-300 border-rose-400/30 bg-rose-500/10",
  cancelled: "text-zinc-300 border-zinc-400/30 bg-zinc-500/10",
  expired: "text-zinc-300 border-zinc-400/30 bg-zinc-500/10",
};

const PeerInterviewHub = () => {
  const { getToken } = useAuth();
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
  const [hasConfiguredPreferences, setHasConfiguredPreferences] =
    useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(true);
  const [showMatchmakingPopup, setShowMatchmakingPopup] = useState(false);
  const [showStartInterviewPopup, setShowStartInterviewPopup] = useState(false);
  const [startInterviewCountdown, setStartInterviewCountdown] = useState(10);
  const [matchedSessionId, setMatchedSessionId] = useState("");

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

  const beginMatchedTransition = useCallback((sessionId) => {
    if (!sessionId) return;

    setMatchedSessionId(sessionId);
    setShowMatchmakingPopup(true);

    setTimeout(() => {
      setShowMatchmakingPopup(false);
      setStartInterviewCountdown(10);
      setShowStartInterviewPopup(true);
    }, 1500);
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
      setHasConfiguredPreferences(configured);
      setIsEditingPreferences(!configured);
      setIncoming(requestsRes.data?.incoming || []);
      setOutgoing(requestsRes.data?.outgoing || []);
      setQueueStatus(queueRes.data?.queueEntry || null);
      setDiscoverUsers(usersRes.data?.users || []);
      setDiscoverLoading(false);
      setShowMatchmakingPopup(queueRes.data?.queueEntry?.status === "waiting");
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
        toast.success("Match found");
        beginMatchedTransition(queueEntry.matchedSessionId._id);
        return;
      }

      if (queueEntry?.status !== "waiting") {
        setShowMatchmakingPopup(false);
      }
    } catch (_) {
      // Silent polling failure.
    }
  }, [authHeaders, beginMatchedTransition]);

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
    if (!showStartInterviewPopup || !matchedSessionId) return undefined;

    const timer = setInterval(() => {
      setStartInterviewCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setShowStartInterviewPopup(false);
          navigate(`/peer-interview/session/${matchedSessionId}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [matchedSessionId, navigate, showStartInterviewPopup]);

  const onToggle = (field) => {
    setPreferences((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const savePreferences = async () => {
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
      setHasConfiguredPreferences(true);
      setIsEditingPreferences(false);
      toast.success("Preferences saved");
    } catch (error) {
      const message =
        error?.response?.data?.message || "Could not save preferences";
      toast.error(message);
    } finally {
      setSavingPrefs(false);
    }
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
        toast.success("Match found");
        beginMatchedTransition(res.data.session._id);
        return;
      }

      toast.success("Added to instant queue");
      setShowMatchmakingPopup(true);
      await hydrate();
    } catch (error) {
      const message = error?.response?.data?.message || "Could not join queue";
      toast.error(message);
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
      toast.success("Left queue");
      setShowMatchmakingPopup(false);
      setShowStartInterviewPopup(false);
      setMatchedSessionId("");
      await hydrate();
    } catch (error) {
      const message = error?.response?.data?.message || "Could not leave queue";
      toast.error(message);
    } finally {
      setQueueBusy(false);
    }
  };

  const queueLabel = useMemo(() => {
    if (!queueStatus) return "not_joined";
    return queueStatus.status;
  }, [queueStatus]);

  const isSessionJoinable = useCallback((session) => {
    if (!session) return false;

    return !["ended", "cancelled"].includes(session.status);
  }, []);

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 px-4 md:px-8 py-8">
      <style>{`
        @keyframes matchPulse {
          0% { transform: scale(0.95); opacity: 0.5; }
          70% { transform: scale(1.08); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.5; }
        }
        .match-pulse {
          animation: matchPulse 1.8s ease-in-out infinite;
        }
      `}</style>

      {showMatchmakingPopup && queueStatus?.status === "waiting" && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-[#bef264]/25 bg-zinc-900 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-[#bef264]/10 border border-[#bef264]/30 flex items-center justify-center match-pulse">
              <FiUsers className="text-[#bef264]" size={32} />
            </div>
            <h3 className="text-xl font-black">Finding your interview match</h3>
            <p className="text-zinc-400 text-sm mt-2">
              We are matching you with a compatible peer. Keep this screen open.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#bef264] animate-bounce" />
              <span className="h-2 w-2 rounded-full bg-[#bef264] animate-bounce [animation-delay:120ms]" />
              <span className="h-2 w-2 rounded-full bg-[#bef264] animate-bounce [animation-delay:240ms]" />
            </div>
            <button
              onClick={leaveQueue}
              disabled={queueBusy}
              className="mt-6 w-full px-4 py-2 rounded-lg border border-white/15 bg-zinc-950 hover:bg-zinc-800 disabled:opacity-70"
            >
              {queueBusy ? "Leaving..." : "Cancel Matchmaking"}
            </button>
          </div>
        </div>
      )}

      {showStartInterviewPopup && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center px-4">
          <div className="w-full max-w-md rounded-2xl border border-emerald-300/25 bg-zinc-900 p-6 text-center shadow-2xl">
            <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-emerald-500/10 border border-emerald-400/30 flex items-center justify-center match-pulse">
              <FiUsers className="text-emerald-300" size={32} />
            </div>
            <h3 className="text-xl font-black">Match Found</h3>
            <p className="text-zinc-300 text-sm mt-2">
              Starting your interview in{" "}
              <span className="text-emerald-300 font-bold">
                {startInterviewCountdown}s
              </span>
            </p>
            <button
              onClick={() =>
                navigate(`/peer-interview/session/${matchedSessionId}`)
              }
              className="mt-5 w-full px-4 py-2 rounded-lg bg-[#bef264] text-black font-semibold"
            >
              Start Now
            </button>
            <button
              onClick={leaveQueue}
              className="mt-2 w-full px-4 py-2 rounded-lg border border-white/15 bg-zinc-950 hover:bg-zinc-800"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight">
              Peer Interview
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Direct requests + instant matching with in-app LiveKit room.
            </p>
          </div>
          <button
            onClick={hydrate}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-white/10 bg-zinc-900 hover:bg-zinc-800 transition"
            disabled={loading}
          >
            <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-zinc-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold">Matching Preferences</h2>
              {hasConfiguredPreferences && !isEditingPreferences && (
                <button
                  onClick={() => setIsEditingPreferences(true)}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/15 bg-zinc-950 hover:bg-zinc-800 text-sm"
                >
                  <FiSettings /> Settings
                </button>
              )}
            </div>

            {!isEditingPreferences && hasConfiguredPreferences ? (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">
                  Preferences are saved. Use{" "}
                  <span className="text-zinc-200 font-medium">Settings</span> to
                  update them anytime.
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 border border-white/10">
                    Gender: {preferences.genderIdentity.replaceAll("_", " ")}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 border border-white/10">
                    Match: {preferences.preferredMatch.replaceAll("_", " ")}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 border border-white/10">
                    Role: {preferences.targetRole || "Not set"}
                  </span>
                  <span className="px-2.5 py-1 rounded-md text-xs bg-zinc-800 border border-white/10">
                    Language: {preferences.preferredLanguage || "English"}
                  </span>
                </div>
                {Array.isArray(preferences.targetSkills) &&
                  preferences.targetSkills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {preferences.targetSkills.map((skill) => (
                        <span
                          key={skill}
                          className="px-2 py-1 rounded-md text-xs border border-[#bef264]/25 bg-[#bef264]/10 text-[#d8f9a0]"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 gap-3">
                  <label className="text-sm space-y-1">
                    <span className="text-zinc-400">Gender identity</span>
                    <select
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2"
                      value={preferences.genderIdentity}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          genderIdentity: e.target.value,
                        }))
                      }
                    >
                      <option value="prefer_not_to_say">
                        Prefer not to say
                      </option>
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                      <option value="non_binary">Non-binary</option>
                    </select>
                  </label>

                  <label className="text-sm space-y-1">
                    <span className="text-zinc-400">Preferred match</span>
                    <select
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2"
                      value={preferences.preferredMatch}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          preferredMatch: e.target.value,
                        }))
                      }
                    >
                      <option value="any">Any</option>
                      <option value="female_only">Female only</option>
                      <option value="male_only">Male only</option>
                      <option value="non_binary_only">Non-binary only</option>
                    </select>
                  </label>

                  <label className="text-sm space-y-1">
                    <span className="text-zinc-400">Target role</span>
                    <input
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2"
                      placeholder="Frontend Developer"
                      value={preferences.targetRole || ""}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          targetRole: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="text-sm space-y-1">
                    <span className="text-zinc-400">Preferred language</span>
                    <input
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2"
                      value={preferences.preferredLanguage || "English"}
                      onChange={(e) =>
                        setPreferences((prev) => ({
                          ...prev,
                          preferredLanguage: e.target.value,
                        }))
                      }
                    />
                  </label>

                  <label className="text-sm space-y-1 sm:col-span-2">
                    <span className="text-zinc-400">
                      Target skills (comma-separated)
                    </span>
                    <input
                      className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2"
                      placeholder="react, nodejs, dsa"
                      value={skillsInput}
                      onChange={(e) => setSkillsInput(e.target.value)}
                    />
                  </label>
                </div>

                <div className="grid sm:grid-cols-3 gap-2">
                  <button
                    className={`px-3 py-2 rounded-lg border text-sm ${preferences.isPeerMatchingEnabled ? "border-[#bef264]/40 bg-[#bef264]/10 text-[#d8f9a0]" : "border-white/10 bg-zinc-950 text-zinc-300"}`}
                    onClick={() => onToggle("isPeerMatchingEnabled")}
                  >
                    Matching {preferences.isPeerMatchingEnabled ? "ON" : "OFF"}
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg border text-sm ${preferences.allowDirectInvites ? "border-[#bef264]/40 bg-[#bef264]/10 text-[#d8f9a0]" : "border-white/10 bg-zinc-950 text-zinc-300"}`}
                    onClick={() => onToggle("allowDirectInvites")}
                  >
                    Direct Invites{" "}
                    {preferences.allowDirectInvites ? "ON" : "OFF"}
                  </button>
                  <button
                    className={`px-3 py-2 rounded-lg border text-sm ${preferences.allowInstantMatch ? "border-[#bef264]/40 bg-[#bef264]/10 text-[#d8f9a0]" : "border-white/10 bg-zinc-950 text-zinc-300"}`}
                    onClick={() => onToggle("allowInstantMatch")}
                  >
                    Instant Match {preferences.allowInstantMatch ? "ON" : "OFF"}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={savePreferences}
                    disabled={savingPrefs}
                    className="px-4 py-2 rounded-lg bg-[#bef264] text-black font-bold hover:bg-[#d8f78e] disabled:opacity-70"
                  >
                    <span className="inline-flex items-center gap-2">
                      <FiEdit2 />{" "}
                      {savingPrefs ? "Saving..." : "Save Preferences"}
                    </span>
                  </button>
                  {hasConfiguredPreferences && (
                    <button
                      onClick={() => setIsEditingPreferences(false)}
                      className="px-4 py-2 rounded-lg border border-white/15 bg-zinc-950 hover:bg-zinc-800"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </>
            )}
          </section>

          <section className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold">Instant Start With Strangers</h2>
            <p className="text-sm text-zinc-400">
              Current status:{" "}
              <span className="font-semibold text-zinc-200 uppercase">
                {queueLabel}
              </span>
            </p>
            <p className="text-xs text-zinc-500">
              Click Match Now to instantly start with a stranger. You will be
              auto-joined when a match is found.
            </p>
            <div className="flex gap-2">
              <button
                onClick={joinQueue}
                disabled={queueBusy}
                className="flex-1 px-4 py-2 rounded-lg bg-[#bef264] text-black font-bold disabled:opacity-70"
              >
                {queueBusy ? "Matching..." : "Match Now"}
              </button>
              <button
                onClick={leaveQueue}
                disabled={queueBusy}
                className="flex-1 px-4 py-2 rounded-lg border border-white/15 bg-zinc-950 hover:bg-zinc-800"
              >
                Stop
              </button>
            </div>
          </section>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          <section className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5 space-y-4">
            <h2 className="text-lg font-bold">Send Direct Invitation</h2>
            <p className="text-sm text-zinc-400">
              Select a user and send interview invitation directly.
            </p>
            <input
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2"
              placeholder="Search by name, email, role, or skills"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />
            <textarea
              className="w-full bg-zinc-950 border border-white/10 rounded-lg px-3 py-2 min-h-[84px]"
              placeholder="Optional invitation message"
              value={requestMessage}
              onChange={(e) => setRequestMessage(e.target.value)}
            />

            <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
              {discoverLoading ? (
                <p className="text-sm text-zinc-500">Loading users...</p>
              ) : filteredDiscoverUsers.length === 0 ? (
                <p className="text-sm text-zinc-500">No users found.</p>
              ) : (
                filteredDiscoverUsers.map((user) => {
                  const fullName =
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "Anonymous User";
                  const canInvite =
                    !user.isBlocked &&
                    user.isPeerMatchingEnabled &&
                    user.allowDirectInvites;

                  return (
                    <div
                      key={user._id}
                      className="rounded-xl border border-white/10 bg-zinc-950/70 p-3"
                    >
                      <div className="flex items-start gap-3">
                        {user.avatar ? (
                          <img
                            src={user.avatar}
                            alt={fullName}
                            className="h-11 w-11 rounded-full object-cover border border-white/10"
                          />
                        ) : (
                          <div className="h-11 w-11 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center text-zinc-300">
                            <FiUser />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-sm text-zinc-100 truncate">
                              {fullName}
                            </p>
                            {user.targetRole ? (
                              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-white/10 text-zinc-300 bg-zinc-800">
                                {user.targetRole}
                              </span>
                            ) : null}
                            {!user.isPeerMatchingEnabled && (
                              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-amber-300/20 text-amber-300 bg-amber-500/10">
                                Matching Off
                              </span>
                            )}
                            {user.isBlocked && (
                              <span className="text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border border-rose-300/20 text-rose-300 bg-rose-500/10">
                                Blocked
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-zinc-400 mt-1 inline-flex items-center gap-1 truncate max-w-full">
                            <FiMail /> {user.email}
                          </p>
                          <p className="text-xs text-zinc-500 mt-1">
                            Language: {user.preferredLanguage || "English"}
                          </p>

                          {Array.isArray(user.targetSkills) &&
                          user.targetSkills.length > 0 ? (
                            <div className="mt-2 flex flex-wrap gap-1.5">
                              {user.targetSkills.slice(0, 5).map((skill) => (
                                <span
                                  key={`${user._id}-${skill}`}
                                  className="text-[10px] px-2 py-0.5 rounded border border-[#bef264]/20 bg-[#bef264]/10 text-[#d8f9a0]"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          ) : null}
                        </div>

                        <button
                          onClick={() => sendDirectRequest(user._id, fullName)}
                          disabled={
                            !canInvite ||
                            (sendingRequest &&
                              sendingToUserId === String(user._id))
                          }
                          className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#bef264] text-black text-xs font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiSend />
                          {sendingRequest &&
                          sendingToUserId === String(user._id)
                            ? "Sending"
                            : "Invite"}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>

          <section className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5">
            <h2 className="text-lg font-bold mb-3">Incoming Requests</h2>
            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {incoming.length === 0 && (
                <p className="text-sm text-zinc-500">No incoming requests.</p>
              )}
              {incoming.map((request) => {
                const requester = request.requesterId || {};
                const fullName =
                  `${requester.firstName || ""} ${requester.lastName || ""}`.trim() ||
                  "User";

                return (
                  <div
                    key={request._id}
                    className="rounded-xl border border-white/10 bg-zinc-950/70 p-3"
                  >
                    <div className="flex items-start gap-3">
                      {requester.avatar ? (
                        <img
                          src={requester.avatar}
                          alt={fullName}
                          className="h-11 w-11 rounded-full object-cover border border-white/10"
                        />
                      ) : (
                        <div className="h-11 w-11 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center text-zinc-300">
                          <FiUser />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-sm text-zinc-100 truncate">
                            {fullName}
                          </p>
                          <span
                            className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${statusColor[request.status] || statusColor.pending}`}
                          >
                            {request.status}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-400 mt-1 inline-flex items-center gap-1 truncate max-w-full">
                          <FiMail /> {requester.email || "No email"}
                        </p>
                        {request.message ? (
                          <p className="text-xs mt-1.5 text-zinc-300">
                            {request.message}
                          </p>
                        ) : null}
                        <p className="text-xs mt-2 text-zinc-500 inline-flex items-center gap-1">
                          <FiClock />{" "}
                          {new Date(request.createdAt).toLocaleString()}
                        </p>

                        {request.status === "pending" && (
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => respond(request._id, "accept")}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
                            >
                              <FiUserCheck /> Accept
                            </button>
                            <button
                              onClick={() => respond(request._id, "reject")}
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
                            >
                              <FiXCircle /> Reject
                            </button>
                          </div>
                        )}

                        {request.status === "accepted_waiting_sender" && (
                          <div className="mt-3 rounded-lg border border-cyan-300/20 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
                            Accepted. Waiting for sender to start the interview.
                          </div>
                        )}

                        {request.sessionId &&
                          isSessionJoinable(request.sessionId) && (
                            <div className="mt-3 flex gap-2">
                              <button
                                onClick={() =>
                                  navigate(
                                    `/peer-interview/session/${request.sessionId._id}`,
                                  )
                                }
                                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#bef264] text-black text-sm font-bold"
                              >
                                <FiUsers /> Join Room
                              </button>
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <section className="bg-zinc-900/70 border border-white/10 rounded-2xl p-5">
          <h2 className="text-lg font-bold mb-3">Outgoing Requests</h2>
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
            {outgoing.length === 0 && (
              <p className="text-sm text-zinc-500">No outgoing requests.</p>
            )}
            {outgoing.map((request) => {
              const recipient = request.recipientId || {};
              const fullName =
                `${recipient.firstName || ""} ${recipient.lastName || ""}`.trim() ||
                "User";
              const canStartInterview =
                request.status === "accepted_waiting_sender" ||
                (request.status === "accepted" && !request.sessionId);

              return (
                <div
                  key={request._id}
                  className="rounded-xl border border-white/10 bg-zinc-950/70 p-3"
                >
                  <div className="flex items-start gap-3">
                    {recipient.avatar ? (
                      <img
                        src={recipient.avatar}
                        alt={fullName}
                        className="h-11 w-11 rounded-full object-cover border border-white/10"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-full border border-white/10 bg-zinc-800 flex items-center justify-center text-zinc-300">
                        <FiUser />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-semibold text-sm text-zinc-100 truncate">
                          {fullName}
                        </p>
                        <span
                          className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded border ${statusColor[request.status] || statusColor.pending}`}
                        >
                          {request.status}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 mt-1 inline-flex items-center gap-1 truncate max-w-full">
                        <FiMail /> {recipient.email || "No email"}
                      </p>
                      {request.message ? (
                        <p className="text-xs mt-1.5 text-zinc-300">
                          {request.message}
                        </p>
                      ) : null}
                      <p className="text-xs mt-2 text-zinc-500 inline-flex items-center gap-1">
                        <FiClock />{" "}
                        {new Date(request.createdAt).toLocaleString()}
                      </p>

                      {request.status === "accepted_waiting_sender" && (
                        <p className="text-xs mt-2 text-cyan-300">
                          Invitation accepted. Start the interview when you are
                          ready.
                        </p>
                      )}

                      {request.sessionId &&
                        isSessionJoinable(request.sessionId) && (
                          <p className="text-xs mt-2 text-zinc-400">
                            Room is ready.
                          </p>
                        )}

                      <div className="mt-3 flex gap-2 flex-wrap">
                        {canStartInterview && (
                          <button
                            onClick={() => startAcceptedInterview(request._id)}
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#bef264] text-black text-sm font-bold"
                          >
                            <FiSend /> Start Interview
                          </button>
                        )}
                        {request.sessionId &&
                          isSessionJoinable(request.sessionId) && (
                            <button
                              onClick={() =>
                                navigate(
                                  `/peer-interview/session/${request.sessionId._id}`,
                                )
                              }
                              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md border border-white/15 bg-zinc-800 text-sm"
                            >
                              <FiUsers /> Open Room
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PeerInterviewHub;
