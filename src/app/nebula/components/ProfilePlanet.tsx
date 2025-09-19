// src/app/nebula/components/ProfilePlanet.tsx
'use client';

type Props = {
  avatarUrl: string | null;
  color: string; // hex like "#60a5fa"
  onEdit?: () => void;
};

export default function ProfilePlanet({ avatarUrl, color, onEdit }: Props) {
  // Normalize color => fallback if invalid
  const validHex = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(color) ? color : '#60a5fa';

  // Mild glossy highlight using the chosen color
  const planetBg = {
    background: `radial-gradient(110% 110% at 30% 30%, ${withAlpha(
      validHex,
      0.65
    )} 0%, ${withAlpha(validHex, 0.35)} 45%, rgba(255,255,255,0.04) 80%)`,
  } as const;

  return (
    <div className="mt-12 flex items-center justify-center">
      <div className="relative">
        {/* soft aura */}
        <div className="absolute -inset-24 blur-3xl opacity-30 pointer-events-none" />
        {/* planet */}
        <div
          className="relative h-44 w-44 rounded-full shadow-2xl ring-1 ring-white/10 overflow-hidden"
          style={planetBg}
        >
          {/* avatar inside the planet */}
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt="avatar"
              className="absolute inset-0 h-full w-full object-cover opacity-90 mix-blend-luminosity"
            />
          ) : (
            <div className="absolute inset-0 rounded-full opacity-10" />
          )}

          {/* subtle gloss */}
          <div className="pointer-events-none absolute inset-0 rounded-full"
               style={{ background: 'radial-gradient(60% 50% at 28% 22%, rgba(255,255,255,.25), rgba(255,255,255,0) 60%)' }} />
        </div>

        {/* edit button */}
        <div className="mt-3 text-center">
          <button
            onClick={onEdit}
            className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-xs hover:bg-white/15 transition"
          >
            Edit profile
          </button>
        </div>
      </div>
    </div>
  );
}

/** Convert #rgb or #rrggbb to rgba with alpha */
function withAlpha(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const isShort = h.length === 3;
  const r = parseInt(isShort ? h[0] + h[0] : h.slice(0, 2), 16);
  const g = parseInt(isShort ? h[1] + h[1] : h.slice(2, 4), 16);
  const b = parseInt(isShort ? h[2] + h[2] : h.slice(4, 6), 16);
  const a = Math.max(0, Math.min(1, alpha));
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}