import { useProctoring } from "../ProctoringProvider";

const ViolationLogger = () => {
  const { violationLog } = useProctoring();

  return (
    <div className="rounded-3xl border border-white/10 bg-zinc-950/90 p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Violations</p>
          <h3 className="text-sm font-semibold text-white">Recent events</h3>
        </div>
        <span className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-zinc-300">
          {violationLog.length}
        </span>
      </div>

      <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
        {violationLog.length === 0 ? (
          <p className="text-sm text-zinc-500">No suspicious events detected yet.</p>
        ) : (
          violationLog.map((event, index) => (
            <div key={`${event.eventType}-${index}`} className="rounded-3xl bg-white/5 p-3 border border-white/5">
              <div className="flex items-center justify-between text-xs text-zinc-400 mb-1">
                <span>{event.eventType.replace(/-/g, " ")}</span>
                <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
              </div>
              <p className="text-sm text-zinc-200">{event.message}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ViolationLogger;
