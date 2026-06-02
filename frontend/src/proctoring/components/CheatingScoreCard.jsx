import { useProctoring } from "../ProctoringProvider";

const CheatingScoreCard = () => {
  const { suspicionScore, focusPercentage, attentionScore, riskLevel } = useProctoring();

  return (
    <div className="rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950/95 to-slate-900/90 p-4 shadow-lg shadow-black/20">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-zinc-400">Risk Score</p>
          <h3 className="mt-2 text-lg font-semibold text-white">Suspicion index</h3>
        </div>
        <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-sm font-semibold text-emerald-200">
          {riskLevel}
        </span>
      </div>

      <div className="mt-5 space-y-4">
        <div className="rounded-3xl bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
            <span>Attention</span>
            <span className="font-semibold text-white">{attentionScore}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: `${attentionScore}%` }} />
          </div>
        </div>

        <div className="rounded-3xl bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
            <span>Focus</span>
            <span className="font-semibold text-white">{focusPercentage}%</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-cyan-400" style={{ width: `${focusPercentage}%` }} />
          </div>
        </div>

        <div className="rounded-3xl bg-white/5 p-4">
          <div className="flex items-center justify-between text-sm text-zinc-400 mb-3">
            <span>Cheating score</span>
            <span className="font-semibold text-white">{suspicionScore}</span>
          </div>
          <div className="h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-red-500" style={{ width: `${Math.min(100, suspicionScore)}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheatingScoreCard;
