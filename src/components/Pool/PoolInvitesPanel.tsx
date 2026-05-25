import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { usePoolInvites, useRevokeInvite } from '@/queries/pools';

interface PoolInvitesPanelProps {
  poolId: string;
}

export const PoolInvitesPanel = ({ poolId }: PoolInvitesPanelProps) => {
  const invitesQuery = usePoolInvites(poolId);
  const revoke = useRevokeInvite(poolId);
  const [error, setError] = useState<string | null>(null);

  if (invitesQuery.isLoading) return null;
  const invites = invitesQuery.data ?? [];
  if (invites.length === 0) return null;

  const onRevoke = async (id: string) => {
    setError(null);
    try {
      await revoke.mutateAsync(id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
        Pending invites · {invites.length}
      </h2>
      <ul className="flex flex-col divide-y divide-accent-200/10 rounded-xl border border-accent-200/15">
        {invites.map(invite => (
          <li
            key={invite._id}
            className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
          >
            <div className="flex flex-col gap-0.5">
              <span>{invite.invitedEmail}</span>
              <span className="text-xs text-accent-200/50">
                {invite.invitedUid ? 'known user' : 'not yet signed in'}
              </span>
            </div>
            <Button
              variant="ghost"
              onClick={() => onRevoke(invite._id)}
              disabled={revoke.isPending}
            >
              Revoke
            </Button>
          </li>
        ))}
      </ul>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </section>
  );
};
