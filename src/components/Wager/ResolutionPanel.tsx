import { useState } from 'react';
import { Button } from '@/components/common/Button';
import {
  useAdminResolve,
  useConfirmResolution,
  useDisputeResolution,
  useProposeResolution,
} from '@/queries/wagers';
import type { WagerDoc } from '@/types/wager';

interface ResolutionPanelProps {
  wager: WagerDoc;
  poolId: string;
  myUid: string;
  iAmStaked: boolean;
  iAmAdmin: boolean;
}

export const ResolutionPanel = ({
  wager,
  poolId,
  myUid,
  iAmStaked,
  iAmAdmin,
}: ResolutionPanelProps) => {
  const propose = useProposeResolution(poolId, wager._id);
  const confirm = useConfirmResolution(poolId, wager._id);
  const dispute = useDisputeResolution(poolId, wager._id);
  const adminResolve = useAdminResolve(poolId, wager._id);
  const [proposeOptionId, setProposeOptionId] = useState(wager.options[0]?.id ?? '');
  const [adminOptionId, setAdminOptionId] = useState(wager.options[0]?.id ?? '');
  const [error, setError] = useState<string | null>(null);

  const wrap = async (fn: () => Promise<unknown>) => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  // --- active: any staked participant can propose ----------------------------
  if (wager.status === 'active' && iAmStaked) {
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-accent-200/15 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
          Propose resolution
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          {wager.options.map(o => (
            <label key={o.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="proposeOption"
                value={o.id}
                checked={proposeOptionId === o.id}
                onChange={() => setProposeOptionId(o.id)}
                className="size-4 accent-accent-500"
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            onClick={() => void wrap(() => propose.mutateAsync(proposeOptionId))}
            disabled={propose.isPending || !proposeOptionId}
          >
            {propose.isPending ? 'Proposing…' : 'Propose'}
          </Button>
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
      </section>
    );
  }

  // --- pending_confirmation: confirm / dispute ------------------------------
  if (wager.status === 'pending_confirmation' && wager.resolution) {
    const proposedOption = wager.options.find(o => o.id === wager.resolution!.optionId);
    const stakedOthers = wager.participants
      .map(p => p.uid)
      .filter(u => u !== wager.resolution!.proposedBy);
    const alreadyConfirmed = wager.resolution.confirmations.includes(myUid);
    const isProposer = myUid === wager.resolution.proposedBy;
    const canAct = iAmStaked && !isProposer && !alreadyConfirmed;
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-yellow-100/80">
          Awaiting confirmation
        </h2>
        <p className="text-sm">
          <span className="font-mono">{wager.resolution.proposedBy.slice(0, 8)}…</span> proposed{' '}
          <span className="font-semibold">{proposedOption?.label ?? wager.resolution.optionId}</span>
          {' '}as the winner.
        </p>
        <p className="text-xs text-accent-200/70">
          {wager.resolution.confirmations.length} of {stakedOthers.length} other participants have
          confirmed.
        </p>
        {canAct && (
          <div className="flex gap-2">
            <Button
              onClick={() => void wrap(() => confirm.mutateAsync())}
              disabled={confirm.isPending || dispute.isPending}
            >
              {confirm.isPending ? 'Confirming…' : 'Confirm'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => void wrap(() => dispute.mutateAsync())}
              disabled={confirm.isPending || dispute.isPending}
            >
              {dispute.isPending ? 'Disputing…' : 'Dispute'}
            </Button>
          </div>
        )}
        {alreadyConfirmed && (
          <p className="text-xs text-accent-200/70">You've confirmed. Waiting on others.</p>
        )}
        {isProposer && (
          <p className="text-xs text-accent-200/70">
            You proposed this resolution. Waiting on others to confirm or dispute.
          </p>
        )}
        {error && <p className="text-xs text-red-300">{error}</p>}
      </section>
    );
  }

  // --- disputed: admin-only resolve / void ---------------------------------
  if (wager.status === 'disputed') {
    if (!iAmAdmin) {
      return (
        <section className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-red-100/80">
            Disputed
          </h2>
          <p className="mt-1 text-accent-100">Waiting on a pool admin to resolve this.</p>
        </section>
      );
    }
    return (
      <section className="flex flex-col gap-3 rounded-xl border border-red-500/30 bg-red-500/10 p-4">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-red-100/80">
          Admin: resolve dispute
        </h2>
        <div className="flex flex-col gap-2 text-sm">
          {wager.options.map(o => (
            <label key={o.id} className="flex items-center gap-2">
              <input
                type="radio"
                name="adminOption"
                value={o.id}
                checked={adminOptionId === o.id}
                onChange={() => setAdminOptionId(o.id)}
                className="size-4 accent-accent-500"
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() =>
              void wrap(() => adminResolve.mutateAsync({ optionId: adminOptionId }))
            }
            disabled={adminResolve.isPending || !adminOptionId}
          >
            {adminResolve.isPending ? 'Settling…' : 'Settle as winner'}
          </Button>
          <Button
            variant="ghost"
            onClick={() => void wrap(() => adminResolve.mutateAsync({ void: true }))}
            disabled={adminResolve.isPending}
          >
            Void & refund
          </Button>
        </div>
        {error && <p className="text-xs text-red-300">{error}</p>}
      </section>
    );
  }

  // --- settled / voided: terminal display ----------------------------------
  if (wager.status === 'settled') {
    const winningOption = wager.options.find(o => o.id === wager.settledOptionId);
    return (
      <section className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-emerald-100/80">
          Settled
        </h2>
        <p className="mt-1 text-accent-100">
          Winner: <span className="font-semibold">{winningOption?.label ?? wager.settledOptionId}</span>
        </p>
      </section>
    );
  }
  if (wager.status === 'voided') {
    return (
      <section className="rounded-xl border border-zinc-500/30 bg-zinc-500/10 p-4 text-sm">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-zinc-100/80">
          Voided
        </h2>
        <p className="mt-1 text-accent-100">
          {wager.voidReason ? `Reason: ${wager.voidReason.replaceAll('_', ' ')}.` : null} All stakes
          were refunded.
        </p>
      </section>
    );
  }

  return null;
};
