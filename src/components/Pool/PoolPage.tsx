import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/auth/useAuth';
import { AppHeader } from '@/components/AppShell/AppHeader';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { InviteForm } from './InviteForm';
import { MemberList } from './MemberList';
import { PoolInvitesPanel } from './PoolInvitesPanel';
import { PoolSettings } from './PoolSettings';
import { useLeavePool, usePool } from '@/queries/pools';
import { ApiError } from '@/api/client';
import { WagersList } from './WagersList';
import { usePoolChannel } from '@/realtime/usePoolChannel';

interface PoolPageProps {
  poolId: string;
}

export const PoolPage = ({ poolId }: PoolPageProps) => {
  const navigate = useNavigate();
  const poolQuery = usePool(poolId);
  const leave = useLeavePool(poolId);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  usePoolChannel(poolId);

  if (poolQuery.isLoading) return <Loading />;

  if (poolQuery.isError) {
    const is404 = poolQuery.error instanceof ApiError && poolQuery.error.status === 404;
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-accent-100">
            {is404 ? 'Pool not found.' : 'Something went wrong loading this pool.'}
          </p>
        </main>
      </div>
    );
  }

  const pool = poolQuery.data!;
  const me = user ? pool.members[user.uid] : undefined;
  const isAdmin = me?.role === 'admin';

  const onLeave = async () => {
    if (!window.confirm(`Leave "${pool.name}"? Your balance will be forfeited.`)) return;
    setError(null);
    try {
      await leave.mutateAsync();
      void navigate({ to: '/' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to leave');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-4">
        <header className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-3xl font-semibold">{pool.name}</h1>
            {isAdmin && (
              <Button variant="ghost" onClick={() => setShowSettings(s => !s)}>
                {showSettings ? 'Hide settings' : 'Settings'}
              </Button>
            )}
          </div>
          <p className="text-sm text-accent-200/70">
            Your balance:{' '}
            <span className="font-mono text-white">{me?.balance ?? 0}</span>
            {me && me.pending > 0 && (
              <span className="ml-2 text-accent-200/50">(+{me.pending} pending)</span>
            )}
          </p>
        </header>

        {showSettings && isAdmin && (
          <Card>
            <PoolSettings pool={pool} />
          </Card>
        )}

        {isAdmin && (
          <Card>
            <InviteForm poolId={pool._id} />
          </Card>
        )}

        {isAdmin && <PoolInvitesPanel poolId={pool._id} />}

        <WagersList poolId={pool._id} />

        <MemberList pool={pool} />

        <div className="flex justify-end pt-4">
          <Button variant="ghost" onClick={onLeave} disabled={leave.isPending}>
            {leave.isPending ? 'Leaving…' : 'Leave pool'}
          </Button>
        </div>
        {error && <p className="text-sm text-red-300">{error}</p>}
      </main>
    </div>
  );
};
