import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/auth/useAuth';
import { ApiError } from '@/api/client';
import { AppHeader } from '@/components/AppShell/AppHeader';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';
import { useCancelWager, useDeclineWager, useWager } from '@/queries/wagers';
import { usePool } from '@/queries/pools';
import { ResolutionPanel } from './ResolutionPanel';
import { StakeForm } from './StakeForm';
import { statusClasses, statusLabel } from './statusBadge';
import type { WagerOption, WagerParticipant } from '@/types/wager';

interface WagerPageProps {
  wagerId: string;
}

export const WagerPage = ({ wagerId }: WagerPageProps) => {
  const navigate = useNavigate();
  const wagerQuery = useWager(wagerId);
  const { user } = useAuth();

  if (wagerQuery.isLoading) return <Loading />;
  if (wagerQuery.isError) {
    const is404 = wagerQuery.error instanceof ApiError && wagerQuery.error.status === 404;
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-accent-100">
            {is404 ? 'Wager not found.' : 'Something went wrong loading this wager.'}
          </p>
        </main>
      </div>
    );
  }
  const wager = wagerQuery.data!;
  return (
    <WagerPageInner
      wagerId={wagerId}
      wager={wager}
      myUid={user?.uid ?? ''}
      onBack={() => navigate({ to: '/pools/$poolId', params: { poolId: wager.poolId } })}
    />
  );
};

interface WagerPageInnerProps {
  wagerId: string;
  wager: ReturnType<typeof useWager>['data'] & object;
  myUid: string;
  onBack: () => void;
}

const WagerPageInner = ({ wager, myUid, onBack }: WagerPageInnerProps) => {
  const poolQuery = usePool(wager.poolId);
  const cancel = useCancelWager(wager.poolId, wager._id);
  const decline = useDeclineWager(wager.poolId, wager._id);
  const [error, setError] = useState<string | null>(null);

  if (poolQuery.isLoading) return <Loading />;
  if (!poolQuery.data) return null;
  const pool = poolQuery.data;
  const me = pool.members[myUid];
  const available = me ? me.balance - me.pending : 0;
  const myStake = wager.participants.find(p => p.uid === myUid);
  const iAmCreator = wager.createdBy === myUid;
  const iAmInvited = wager.invitedUids.includes(myUid);
  const iAmAdmin = me?.role === 'admin';
  const totalPot = wager.participants.reduce((s, p) => s + p.stake, 0);

  const stakingOpen =
    (wager.status === 'proposed' || wager.status === 'active') &&
    !myStake &&
    (iAmInvited || iAmCreator) &&
    !wager.declinedUids.includes(myUid);

  const canDecline =
    wager.status !== 'settled' &&
    wager.status !== 'voided' &&
    !myStake &&
    iAmInvited &&
    !wager.declinedUids.includes(myUid);

  const canCancel = iAmCreator && wager.status === 'proposed';

  const onCancel = async () => {
    if (!window.confirm('Cancel this wager? Your stake will be refunded.')) return;
    setError(null);
    try {
      await cancel.mutateAsync();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    }
  };

  const onDecline = async () => {
    setError(null);
    try {
      await decline.mutateAsync();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Decline failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col gap-6 px-6 py-4">
        <header className="flex flex-col gap-2">
          <button onClick={onBack} className="self-start text-xs text-accent-200/70 hover:text-accent-100">
            ← Back to {pool.name}
          </button>
          <div className="flex items-baseline justify-between gap-3">
            <h1 className="text-2xl font-semibold leading-tight">{wager.description}</h1>
            <span
              className={`shrink-0 rounded-full px-2 py-1 text-xs font-medium ${statusClasses(
                wager.status,
              )}`}
            >
              {statusLabel(wager.status)}
            </span>
          </div>
          <p className="text-sm text-accent-200/70">
            Pot: <span className="font-mono text-white">{totalPot}</span> pts ·{' '}
            {wager.participants.length} staked
            {myStake && (
              <span className="ml-3">
                Your stake: <span className="font-mono text-white">{myStake.stake}</span> on{' '}
                <span className="font-semibold">
                  {wager.options.find(o => o.id === myStake.optionId)?.label}
                </span>
              </span>
            )}
          </p>
        </header>

        <OptionsTable options={wager.options} participants={wager.participants} />

        {stakingOpen && (
          <Card>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-accent-200/70">
              Place your stake
            </h2>
            <StakeForm wager={wager} poolId={wager.poolId} available={available} />
          </Card>
        )}

        <ResolutionPanel
          wager={wager}
          poolId={wager.poolId}
          myUid={myUid}
          iAmStaked={Boolean(myStake)}
          iAmAdmin={iAmAdmin}
        />

        <div className="flex flex-wrap justify-end gap-2 pt-2">
          {canDecline && (
            <Button variant="ghost" onClick={onDecline} disabled={decline.isPending}>
              {decline.isPending ? 'Declining…' : 'Decline'}
            </Button>
          )}
          {canCancel && (
            <Button variant="danger" onClick={onCancel} disabled={cancel.isPending}>
              {cancel.isPending ? 'Cancelling…' : 'Cancel wager'}
            </Button>
          )}
        </div>

        {error && <p className="text-sm text-red-300">{error}</p>}
      </main>
    </div>
  );
};

interface OptionsTableProps {
  options: WagerOption[];
  participants: WagerParticipant[];
}

const OptionsTable = ({ options, participants }: OptionsTableProps) => {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
        Options
      </h2>
      <ul className="flex flex-col divide-y divide-accent-200/10 rounded-xl border border-accent-200/15">
        {options.map(o => {
          const backers = participants.filter(p => p.optionId === o.id);
          const total = backers.reduce((s, p) => s + p.stake, 0);
          return (
            <li key={o.id} className="flex flex-col gap-1 px-4 py-3">
              <div className="flex items-baseline justify-between">
                <span className="font-medium">{o.label}</span>
                <span className="text-sm text-accent-200/70">
                  <span className="font-mono text-white">{total}</span> pts ·{' '}
                  {backers.length} backer{backers.length === 1 ? '' : 's'}
                </span>
              </div>
              {backers.length > 0 && (
                <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-accent-200/60">
                  {backers.map(b => (
                    <li key={b.uid} className="font-mono">
                      {b.uid.slice(0, 8)}… ({b.stake})
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
};
