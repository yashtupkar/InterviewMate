import React from "react";
import { FiMail, FiUser } from "react-icons/fi";

const DiscoverPanel = ({
  currentSection,
  discoverLoading,
  filteredDiscoverUsers,
  userSearch,
  setUserSearch,
  sendDirectRequest,
  sendingRequest,
  sendingToUserId,
}) => (
  <div className="lg:col-span-8 space-y-6">
    <div className="glass-panel rounded-3xl p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div>
          <h3 className="text-xl font-bold">
            {currentSection === "search" ? "Search Peers" : "Discover Peers"}
          </h3>
          <p className="text-sm text-zinc-500">
            Find candidates with similar target roles and send invitations.
          </p>
        </div>
        <div className="relative">
          <input
            className="w-full md:w-80 bg-zinc-950/50 border border-white/10 rounded-xl px-4 py-2.5 pl-10 focus:border-[#bef264]/50 outline-none"
            placeholder="Search roles, skills..."
            value={userSearch}
            onChange={(e) => setUserSearch(e.target.value)}
          />
          <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        {discoverLoading ? (
          [1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 skeleton rounded-2xl" />
          ))
        ) : filteredDiscoverUsers.length === 0 ? (
          <p className="text-zinc-500 py-12 text-center col-span-2">
            No peers found matching your criteria.
          </p>
        ) : (
          filteredDiscoverUsers.map((user) => {
            const isSendingToThisUser =
              sendingRequest && sendingToUserId === String(user._id);

            return (
              <div
                key={user._id}
                className="group p-5 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] transition-all"
              >
                <div className="flex gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-800 overflow-hidden border border-white/10 group-hover:border-[#bef264]/50 transition">
                    {user.avatar ? (
                      <img
                        src={user.avatar}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <FiUser className="m-auto mt-4 text-zinc-600" size={24} />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold truncate">
                      {user.firstName} {user.lastName}
                    </h4>
                    <p className="text-xs text-[#bef264] font-medium truncate">
                      {user.targetRole || "Tech Professional"}
                    </p>
                    <div className="flex flex-wrap gap-1 mt-3">
                      {user.targetSkills?.slice(0, 3).map((s) => (
                        <span
                          key={s}
                          className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] text-zinc-400"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-5 pt-4 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                    <FiMail /> {user.email?.split("@")[0]}...
                  </span>
                  <button
                    onClick={() =>
                      sendDirectRequest(user._id, `${user.firstName}`)
                    }
                    disabled={sendingRequest}
                    className="px-4 py-2 rounded-lg bg-[#bef264] text-black text-xs font-bold hover:scale-105 transition disabled:opacity-60"
                  >
                    {isSendingToThisUser ? "Inviting..." : "Invite"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  </div>
);

export default DiscoverPanel;
