'use client';

import UniverseCard from './UniverseCard';

type Unlocked = {
  fund?: boolean;
  market?: boolean;
  // future flags...
};

// ✅ Define a proper item type, with optional badge
type Item = {
  key:
    | 'fund'
    | 'market'
    | 'farm'
    | 'brand'
    | 'factory'
    | 'knowledge'
    | 'shop';
  title: string;
  accent: string;
  unlocked: boolean;
  badge?: string; // <-- optional
};

export default function UniverseGrid({ unlocked }: { unlocked: Unlocked }) {
  const items: Item[] = [
    {
      key: 'fund',
      title: 'Fund',
      accent: 'from-pink-400/40 to-fuchsia-400/20',
      unlocked: !!unlocked.fund,
      // no badge
    },
    {
      key: 'market',
      title: 'Market',
      accent: 'from-emerald-400/40 to-teal-400/20',
      unlocked: !!unlocked.market,
      badge: unlocked.market ? 'New' : undefined,
    },
    { key: 'farm', title: 'Farm', accent: 'from-lime-300/40 to-green-400/25', unlocked: false },
    { key: 'brand', title: 'Brand', accent: 'from-amber-300/40 to-orange-400/25', unlocked: false },
    { key: 'factory', title: 'Factory', accent: 'from-blue-300/40 to-cyan-400/25', unlocked: false },
    { key: 'knowledge', title: 'Knowledge', accent: 'from-violet-300/40 to-purple-400/25', unlocked: false },
    { key: 'shop', title: 'Shop', accent: 'from-rose-300/40 to-pink-400/25', unlocked: false },
  ];

  const handleClick = (key: Item['key']) => {
    if (key === 'fund' && unlocked.fund) alert('Fund universe — perks & receipts (WIP)');
    else if (key === 'market' && unlocked.market) alert('Market universe — WIP');
    // others locked for now
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {items.map((it) => (
        <UniverseCard
          key={it.key}
          title={it.title}
          unlocked={it.unlocked}
          badge={it.badge}         {/* ✅ now valid */}
          accent={it.accent}
          onClick={() => handleClick(it.key)}
        />
      ))}
    </div>
  );
}