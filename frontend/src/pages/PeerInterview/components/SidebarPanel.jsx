import React from "react";
import RequestsGrid from "./RequestsGrid";

const SidebarPanel = ({
  joinQueue,
  queueBusy,
  incoming,
  outgoing,
  respond,
  startAcceptedInterview,
  isSessionJoinable,
  navigate,
}) => (
  <div className="lg:col-span-4 space-y-6">
    <div className="glass-panel rounded-3xl p-6 bg-gradient-to-br from-[#bef264]/10 to-transparent border-[#bef264]/20">
      <h3 className="text-xl font-bold mb-2">Instant Queue</h3>
      <p className="text-sm text-zinc-400 mb-6">
        Skip the invite and match instantly with someone online.
      </p>
      <button
        onClick={joinQueue}
        disabled={queueBusy}
        className="w-full py-4 rounded-2xl bg-[#bef264] text-black font-black text-lg shadow-lg shadow-[#bef264]/10 active:scale-95 transition"
      >
        {queueBusy ? "Entering..." : "Match Now"}
      </button>
    </div>

    <RequestsGrid
      title="Requests"
      incoming={incoming}
      outgoing={outgoing}
      respond={respond}
      startAcceptedInterview={startAcceptedInterview}
      isSessionJoinable={isSessionJoinable}
      navigate={navigate}
      limit={8}
    />
  </div>
);

export default SidebarPanel;
