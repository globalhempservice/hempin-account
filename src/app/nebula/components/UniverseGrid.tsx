// src/app/nebula/components/UniverseGrid.tsx
'use client';

import UniverseCard from './UniverseCard';

type Unlocked = { fund?: boolean; market?: boolean };

type Item = {
  key: 'fund' | 'market' | 'farm' | 'brand' | 'factory' | 'knowledge' | 'shop';
  title: string;
  accent: string;
  unlocked: boolean;
  badge?: string;
};

export default function UniverseGrid({ unlocked }: { unlocked: Unlocked }) {
  const items: Item[] = [
    {
      key: 'fund',
      title: 'Fund',
      accent: 'from-pink-400/40 to-fuchsia-400/20',
      unlocked: !!unlocked?.fund,
    },
    {
      key: 'market',
      title: 'Market',
      accent: 'from-emerald-400/40 to-teal-400/20',
      unlocked: !!unlocked?.market,
      badge: unlocked?.market ? 'New' : undefined,
    },
    {
      key: 'farm',
      title: 'Farm',
      accent: 'from-lime-400/40 to-green-400/20',
      unlocked: false,
    },
    {
      key: 'brand',
      title: 'Brand',
      accent: 'from-amber-400/40 to-orange-400/20',
      unlocked: false,
    },
    {
      key: 'factory',
      title: 'Factory',
      accent: 'from-sky-400/40 to-cyan-400/20',
      unlocked: false,
    },
    {
      key: 'knowledge',
      title: 'Knowledge',
      accent: 'from-violet-400/40 to-indigo-400/20',
      unlocked: false,
    },
    {
      key: 'shop',
      title: 'Shop',
      accent: 'from-slate-400/40 to-slate-500/20',
      unlocked: false,
    },
  ];

  const handleClick = (key: Item['key']) => {
    if (key === 'fund' && unlocked?.fund) alert('Fund universe — perks & receipts (WIP)');
    if (key === 'market' && unlocked?.market) alert('Market universe — WIP');
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
      {items.map((it) => (
        <UniverseCard
          key={it.key}
          title={it.title}
          unlocked={it.unlocked}
          accent={it.accent}
          badge={it.badge}
          onClick={() => handleClick(it.key)}
        />
      ))}
    </div>
  );
}