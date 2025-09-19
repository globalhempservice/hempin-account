// components/ErrorOverlay.tsx
export default function ErrorOverlay({ text }: { text: string }) {
    return (
      <div className="absolute inset-0 grid place-items-center">
        <div className="rounded-md border border-white/10 bg-black/70 px-4 py-3 text-sm">
          {text} <button onClick={() => location.reload()} className="underline ml-2">Retry</button>
        </div>
      </div>
    );
  }
  