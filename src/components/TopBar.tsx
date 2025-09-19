// components/TopBar.tsx
import Link from 'next/link';
export default function TopBar({ email }: { email?: string }) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <Link href="/nebula" className="text-sm font-medium opacity-90 hover:opacity-100">Hempin Account</Link>
        <div className="flex items-center gap-3">
          {email && <span className="text-xs opacity-70 hidden sm:inline">{email}</span>}
          <a href="/logout" className="rounded-md border border-white/15 bg-white/10 px-3 py-1.5 text-sm hover:bg-white/15">Log out</a>
        </div>
      </div>
    </header>
  );
}
