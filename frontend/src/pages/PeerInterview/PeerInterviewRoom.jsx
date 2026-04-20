import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import { Helmet } from "react-helmet-async";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";
import "@livekit/components-styles";

const backendUrl = import.meta.env.VITE_BACKEND_URL;

const PeerInterviewRoom = () => {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const { getToken } = useAuth();
  const mountedRef = useRef(true);
  const endedByMeRef = useRef(false);

  const [roomToken, setRoomToken] = useState("");
  const [roomUrl, setRoomUrl] = useState("");
  const [roomName, setRoomName] = useState("");
  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ending, setEnding] = useState(false);
  const [remoteEnded, setRemoteEnded] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(4);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const authHeaders = async () => {
    const token = await getToken();
    return { Authorization: `Bearer ${token}` };
  };

  const leaveQueueSafely = async () => {
    try {
      const headers = await authHeaders();
      await axios.post(
        `${backendUrl}/api/peer-interview/queue/leave`,
        {},
        { headers },
      );
    } catch (_) {
      // Best-effort cleanup only.
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const headers = await authHeaders();

        const [sessionRes, tokenRes] = await Promise.all([
          axios.get(`${backendUrl}/api/peer-interview/session/${sessionId}`, {
            headers,
          }),
          axios.post(
            `${backendUrl}/api/peer-interview/session/${sessionId}/token`,
            {},
            { headers },
          ),
        ]);

        setSessionData(sessionRes.data.session);
        setRoomToken(tokenRes.data.token);
        setRoomUrl(tokenRes.data.livekitUrl);
        setRoomName(tokenRes.data.roomName);

        await axios.post(
          `${backendUrl}/api/peer-interview/session/${sessionId}/start`,
          {},
          { headers },
        );
      } catch (error) {
        const message =
          error?.response?.data?.message || "Could not initialize room";
        toast.error(message);
        navigate("/peer-interview");
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
      }
    };

    init();
  }, [getToken, navigate, sessionId]);

  useEffect(() => {
    if (loading || remoteEnded) return undefined;

    const timer = setInterval(async () => {
      try {
        const headers = await authHeaders();
        const res = await axios.get(
          `${backendUrl}/api/peer-interview/session/${sessionId}`,
          {
            headers,
          },
        );

        const freshSession = res.data?.session;
        setSessionData(freshSession);

        if (
          !endedByMeRef.current &&
          (freshSession?.status === "ended" ||
            freshSession?.status === "cancelled")
        ) {
          setRemoteEnded(true);
          setRedirectCountdown(4);
          toast("The other user ended the session.");
        }
      } catch (_) {
        // Silent polling failure while user is in room.
      }
    }, 3000);

    return () => clearInterval(timer);
  }, [loading, remoteEnded, sessionId]);

  useEffect(() => {
    if (!remoteEnded) return undefined;

    const timer = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          leaveQueueSafely();
          navigate("/peer-interview");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, remoteEnded]);

  const leaveAndEnd = async () => {
    endedByMeRef.current = true;
    setEnding(true);
    try {
      const headers = await authHeaders();
      await axios.post(
        `${backendUrl}/api/peer-interview/session/${sessionId}/end`,
        { notes: "Ended from peer interview room" },
        { headers },
      );
      await leaveQueueSafely();
      toast.success("Session ended");
      navigate("/peer-interview");
    } catch (error) {
      const message = error?.response?.data?.message || "Could not end session";
      toast.error(message);
    } finally {
      setEnding(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <Helmet>
        <title>Peer Interview Room | PlaceMateAI</title>
      </Helmet>

      <div className="px-4 md:px-8 py-4 border-b border-white/10 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs uppercase tracking-wider text-zinc-400">
            Peer Interview Room
          </p>
          <h1 className="text-xl font-bold">{roomName || "Loading room..."}</h1>
          {sessionData?.status ? (
            <p className="text-sm text-zinc-400 mt-0.5">
              Status: {sessionData.status}
            </p>
          ) : null}
        </div>
        <button
          onClick={leaveAndEnd}
          disabled={ending}
          className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold disabled:opacity-70"
        >
          {ending ? "Ending..." : "End Session"}
        </button>
      </div>

      <div className="h-[calc(100vh-92px)]">
        {remoteEnded && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-rose-300/30 bg-zinc-900 p-6 text-center">
              <h3 className="text-xl font-black">Session Ended</h3>
              <p className="text-zinc-300 mt-2">
                The other user ended this interview session.
              </p>
              <p className="text-zinc-500 text-sm mt-2">
                Redirecting to Peer Interview in {redirectCountdown}s...
              </p>
              <button
                onClick={() => navigate("/peer-interview")}
                className="mt-5 w-full px-4 py-2 rounded-lg bg-[#bef264] text-black font-semibold"
              >
                Go Now
              </button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="h-full flex items-center justify-center text-zinc-300">
            Preparing room...
          </div>
        ) : roomToken && roomUrl && !remoteEnded ? (
          <LiveKitRoom
            token={roomToken}
            serverUrl={roomUrl}
            connect
            video
            audio
            data-lk-theme="default"
            className="h-full"
            onDisconnected={() => {
              if (!endedByMeRef.current && !remoteEnded) {
                toast("Disconnected from room");
              }
            }}
          >
            <VideoConference />
          </LiveKitRoom>
        ) : (
          <div className="h-full flex items-center justify-center text-rose-300">
            Room credentials are missing.
          </div>
        )}
      </div>
    </div>
  );
};

export default PeerInterviewRoom;
