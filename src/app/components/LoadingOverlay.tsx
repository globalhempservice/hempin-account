// components/LoadingOverlay.tsx
export default function LoadingOverlay({ text = 'Loading…' }: { text?: string }) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-black/20 backdrop-blur-sm">
        <div className="rounded-md border border-white/10 bg-black/60 px-4 py-3 text-sm">{text}</div>
      </div>
    );
  }
  