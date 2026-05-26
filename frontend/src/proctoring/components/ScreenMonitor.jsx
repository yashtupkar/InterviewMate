import { useProctoring } from "../ProctoringProvider";

const ScreenMonitor = () => {
  const { screenStatus, requestScreenShare, screenLogs } = useProctoring();
  const statusColor = screenStatus === "active" ? "bg-emerald-500" : screenStatus === "denied" ? "bg-red-500" : "bg-amber-400";

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Screen</p>
          <h3 className="mt-2 text-sm font-semibold text-white">Screen sharing & policy</h3>
        </div>
        <span className={`rounded-full px-2 py-1 text-[11px] text-white ${statusColor}`}>
          {screenStatus}
        </span>
      </div>

      <div className="mt-4 space-y-3 text-sm text-zinc-300">
        <p>Screen sharing must remain active and visible for the duration of the interview.</p>
        <p>{screenLogs.length > 0 ? `${screenLogs.length} screen events captured` : "No screen events logged yet."}</p>
      </div>

      <button
        onClick={requestScreenShare}
        className="mt-4 w-full rounded-2xl bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
      >
        Re-request screen sharing
      </button>
    </div>
  );
};

export default ScreenMonitor;
