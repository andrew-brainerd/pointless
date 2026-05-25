import { useAuth } from '@/auth/useAuth';
import { useSyncUser } from '@/hooks/useSyncUser';
import { SignedInBadge } from '@/components/Auth/SignedInBadge';

export const Home = () => {
  const { user } = useAuth();
  useSyncUser();

  return (
    <main className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold tracking-tight">Pointless</h1>
        <SignedInBadge />
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h2 className="text-4xl font-semibold">
          Welcome{user?.displayName ? `, ${user.displayName.split(' ')[0]}` : ''}.
        </h2>
        <p className="max-w-md text-accent-100">
          Pools and wagers will land in Phase C / Phase D. For now, you're signed in.
        </p>
        <p className="text-sm text-accent-200/70">v0.2.0 — Phase B in progress.</p>
      </section>
    </main>
  );
};
