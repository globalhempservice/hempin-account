// components/LeafPill.tsx
export default function LeafPill({ value }: { value: number }) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs">
        <span className="opacity-80">Leaf XP</span>
        <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-emerald-300">+{value}</span>
      </div>
    );
  }
  