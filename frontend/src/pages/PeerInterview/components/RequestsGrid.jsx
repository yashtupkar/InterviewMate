import React from "react";
import { FiMail, FiSend, FiUser } from "react-icons/fi";

const RequestsGrid = ({
  title,
  incoming,
  outgoing,
  respond,
  startAcceptedInterview,
  isSessionJoinable,
  navigate,
  limit,
  gridClassName,
}) => {
  const requestItems = [...incoming, ...outgoing];

  return (
    <div className="glass-panel rounded-3xl p-6">
      <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
        <FiSend className="text-indigo-400" /> {title}
      </h3>

      <div className={gridClassName || "space-y-4"}>
        {requestItems.length === 0 ? (
          <div className="text-center py-8">
            <FiMail className="mx-auto text-zinc-700 mb-3" size={32} />
            <p className="text-sm text-zinc-500">No active requests</p>
          </div>
        ) : (
          requestItems.slice(0, limit).map((req) => {
            const isIncoming = incoming.some((i) => i._id === req._id);
            const other = isIncoming ? req.requesterId : req.recipientId;
            const status = req.status;

            return (
              <div
                key={req._id}
                className="p-4 rounded-2xl bg-white/[0.03] border border-white/5 space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 overflow-hidden border border-white/10">
                    {other?.avatar ? (
                      <img src={other.avatar} />
                    ) : (
                      <FiUser className="m-auto mt-2 text-zinc-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">
                      {other?.firstName || "User"}
                    </p>
                    <p
                      className={`text-[10px] font-black uppercase tracking-wider ${
                        isIncoming ? "text-emerald-400" : "text-indigo-400"
                      }`}
                    >
                      {isIncoming ? "Incoming" : "Outgoing"} • {status}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {isIncoming && status === "pending" && (
                    <>
                      <button
                        onClick={() => respond(req._id, "accept")}
                        className="flex-1 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 text-[10px] font-bold hover:bg-emerald-500 hover:text-white transition"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => respond(req._id, "reject")}
                        className="flex-1 py-2 rounded-lg bg-white/5 text-zinc-400 text-[10px] font-bold hover:bg-rose-500/20 hover:text-rose-400 transition"
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {!isIncoming &&
                    (status === "accepted_waiting_sender" ||
                      (status === "accepted" && !req.sessionId)) && (
                      <button
                        onClick={() => startAcceptedInterview(req._id)}
                        className="w-full py-2 rounded-lg bg-[#bef264] text-black text-[10px] font-bold"
                      >
                        Start Interview
                      </button>
                    )}
                  {req.sessionId && isSessionJoinable(req.sessionId) && (
                    <button
                      onClick={() =>
                        navigate(`/peer-interview/session/${req.sessionId._id}`)
                      }
                      className="w-full py-2 rounded-lg border border-[#bef264]/30 text-[#bef264] text-[10px] font-bold"
                    >
                      Join Room
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default RequestsGrid;
