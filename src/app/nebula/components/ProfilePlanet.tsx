import { hexToRgbA, tint } from '../lib/colors';

export default function ProfilePlanet({
  avatarUrl,
  planetColor = '#60a5fa',
}: {
  avatarUrl?: string | null;
  planetColor?: string;
}) {
  return (
    <div className="relative">
      <div
        className="absolute -inset-24 blur-3xl opacity-30 pointer-events-none"
        style={{
          background: `radial-gradient(circle, ${hexToRgbA(planetColor, 0.45)}, rgba(0,0,0,0) 60%)`,
        }}
      />
      <div
        className="h-44 w-44 rounded-full shadow-2xl ring-1 ring-white/10 overflow-hidden relative"
        style={{
          background: avatarUrl
            ? `center/cover no-repeat url("${avatarUrl}")`
            : `linear-gradient(135deg, ${tint(planetColor, 0.35)} 0%, ${tint(planetColor, -0.1)} 100%)`,
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background: `radial-gradient(120% 120% at 50% 40%, ${hexToRgbA(planetColor, 0.25)}, transparent 60%)`,
          }}
        />
      </div>
    </div>
  );
}