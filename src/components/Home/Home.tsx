import { Link } from '@tanstack/react-router';
import { useSyncUser } from '@/hooks/useSyncUser';
import { useMyPools } from '@/queries/pools';
import { AppHeader } from '@/components/AppShell/AppHeader';
import { Button } from '@/components/common/Button';
import { InviteList } from '@/components/Invites/InviteList';
import { PoolCard } from '@/components/Pool/PoolCard';

export const Home = () => {
  useSyncUser();
  const poolsQuery = useMyPools();
  const pools = poolsQuery.data ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-8 px-6 py-4">
        <InviteList />

        <section className="flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
              My pools · {pools.length}
            </h2>
            <Link to="/pools/new">
              <Button variant="primary">New pool</Button>
            </Link>
          </div>
          {poolsQuery.isLoading && <p className="text-sm text-accent-200/60">Loading…</p>}
          {!poolsQuery.isLoading && pools.length === 0 && (
            <p className="text-sm text-accent-200/60">
              No pools yet. Create one or accept an invite.
            </p>
          )}
          {pools.length > 0 && (
            <ul className="flex flex-col gap-3">
              {pools.map(pool => (
                <li key={pool._id}>
                  <PoolCard pool={pool} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
};
