import { requireUser } from '@/lib/auth/requireUser';

export default async function MarketHome() {
  await requireUser();

  return (
    <main className="min-h-screen px-6 py-16">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-semibold">Market</h1>
        <p className="mt-2 opacity-80">
          Build your brand and products for the Hempin Directory & Supermarket.
        </p>

        <section className="mt-8 grid gap-4">
          <a
            href="/market/brands"
            className="rounded-xl border border-white/10 bg-white/5 p-5 hover:bg-white/10 transition"
          >
            <div className="text-lg font-medium">Brands</div>
            <div className="mt-1 text-sm opacity-70">
              Create and manage your brand pages. Multiple brands supported.
            </div>
          </a>

          <div className="rounded-xl border border-white/10 bg-white/5 p-5 opacity-60">
            <div className="text-lg font-medium">Products (coming soon)</div>
            <div className="mt-1 text-sm opacity-70">
              Add your products, specs, and pricing for B2B discovery.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}