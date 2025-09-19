'use client';

export default function UniverseCard({
  title,
  unlocked = false,
  badge,
  accent = 'from-slate-400/40 to-slate-500/20',
  onClick,
}: {
  title: string;
  unlocked?: boolean;
  badge?: string;
  accent?: string;        // tailwind gradient tail (to mix up colors)
  onClick?: () => void;   // optional action
}) {
  return (
    <button
      onClick={unlocked ? onClick : undefined}
      className={`group relative rounded-2xl border p-5 text-left transition ${
        unlocked ? 'border-white/10 bg-white/5 hover:bg-white/10'
                 : 'border-white/10 bg-black/20 opacity-70 cursor-not-allowed'
      }`}
    >
      {badge && (
        <span className="absolute top-3 right-3 rounded-full border border-emerald-400/40 bg-emerald-500/20 px-2 py-0.5 text-emerald-200 text-[11px] leading-none shadow-sm">
          {badge}
        </span>
      )}

      <div className="mb-3 h-10 w-10 rounded-full ring-1 ring-white/10">
        <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${accent}`} />
      </div>

      <div className="text-sm opacity-80">{title}</div>
      <div className="text-xs opacity-60 mt-1">
        {unlocked ? 'Unlocked' : 'Locked — coming soon'}
      </div>
    </button>
  );
}