'use client';
import { useEffect, useRef } from 'react';

export default function Orb({ className = '' }: { className?: string }) {
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) return;

    let rAF = 0;
    const max = 18;
    const onMove = (e: MouseEvent) => {
      const { innerWidth: w, innerHeight: h } = window;
      const x = ((e.clientX / w) - 0.5) * 2;
      const y = ((e.clientY / h) - 0.5) * 2;
      const tx = Math.round(x * max);
      const ty = Math.round(y * max);
      cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(() => {
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });

    return () => {
      cancelAnimationFrame(rAF);
      window.removeEventListener('mousemove', onMove);
    };
  }, []);

  return (
    <div ref={wrapRef} aria-hidden className={`pointer-events-none absolute inset-0 flex items-center justify-center ${className}`}>
      <div
        className="
          h-[44vh] w-[44vh] min-h-[320px] min-w-[320px] max-h-[70vh] max-w-[70vh]
          rounded-full opacity-55 blur-3xl mix-blend-screen animate-[orb_7.5s_ease-in-out_infinite]
        "
        style={{ background: 'radial-gradient(closest-side at 58% 42%, #ff9ada 0%, #9f72ff 33%, #0b0a10 70%)' }}
      />
      <div
        className="
          absolute h-[34vh] w-[34vh] min-h-[240px] min-w-[240px] max-h-[54vh] max-w-[54vh]
          rounded-full opacity-60 blur-2xl mix-blend-screen animate-[orbSlow_10s_ease-in-out_infinite]
        "
        style={{ background: 'radial-gradient(closest-side at 46% 54%, rgba(255,180,220,.9) 0%, rgba(180,120,255,.6) 40%, rgba(10,8,20,0) 70%)' }}
      />
      <style>{`
        @keyframes orb { 0%{transform:translateY(-4px) scale(1)} 50%{transform:translateY(4px) scale(1.015)} 100%{transform:translateY(-4px) scale(1)} }
        @keyframes orbSlow { 0%{transform:translateY(3px) scale(1)} 50%{transform:translateY(-3px) scale(.985)} 100%{transform:translateY(3px) scale(1)} }
      `}</style>
    </div>
  );
}
