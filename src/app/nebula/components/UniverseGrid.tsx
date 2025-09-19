'use client';

import UniverseCard from './UniverseCard';

type Unlocked = { fund?: boolean; market?: boolean };

export default function UniverseGrid({ unlocked }: { unlocked: Unlocked }) {
  const items = [
    { key: 'fund',    title: 'Fund',    accent: 'from-pink-400/40 to-fuchsia-400/20',   unlocked: !!unlocked.fund },
    { key: 'market',  title: 'Market',  accent: 'from-emerald-400/40 to-teal-400/20',   unlocked: !!unlocked.market, badge: unlocked.market ? 'New' : undefined },
    { key: 'farm',    title: 'Farm',    accent: 'from-lime-400/40 to-amber-400/20',    unlocked: false },
    { key: 'brand',   title: 'Brand',   accent: 'from-sky-400/40 to-cyan-400/20',      unlocked: false },
    { key: 'factory', title: 'Factory', accent: 'from-orange-400/40 to-red-400/20',    unlocked: false },
    { key: 'knowledge', title: 'Knowledge', accent: 'from-indigo-400/40 to-violet-400/20', unlocked: false },
    { key: 'shop',    title: 'Shop',    accent: 'from-rose-400/40 to-amber-400/20',    unlocked: false },
  ] as const;

  function handleClick(k: string) {
    // later: deep-link to the sub-site; for now just placeholder
    if (k === 'market') alert('Market universe — coming soon');
    if (k === 'fund') alert('Fund universe — coming soon');
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {items.map(it => (
        <UniverseCard
          key={it.key}
          title={it.title}
          unlocked={it.unlocked}
          badge={it.badge}
          accent={it.accent}
          onClick={() => handleClick(it.key)}
        />
      ))}
    </div>
  );
}