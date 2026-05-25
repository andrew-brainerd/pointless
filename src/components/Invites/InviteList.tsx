import { useState } from 'react';
import { useAcceptInvite, useDeclineInvite, useMyInvites } from '@/queries/invites';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import type { InviteDoc } from '@/types/pool';

export const InviteList = () => {
  const invitesQuery = useMyInvites();
  const invites = invitesQuery.data ?? [];

  if (invitesQuery.isLoading) return null;
  if (invites.length === 0) return null;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
        Invites · {invites.length}
      </h2>
      <ul className="flex flex-col gap-3">
        {invites.map(invite => (
          <li key={invite._id}>
            <InviteCard invite={invite} />
          </li>
        ))}
      </ul>
    </section>
  );
};

interface InviteCardProps {
  invite: InviteDoc;
}

const InviteCard = ({ invite }: InviteCardProps) => {
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();
  const [error, setError] = useState<string | null>(null);

  const onAccept = async () => {
    setError(null);
    try {
      await accept.mutateAsync(invite._id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept');
    }
  };

  const onDecline = async () => {
    setError(null);
    try {
      await decline.mutateAsync(invite._id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to decline');
    }
  };

  const pending = accept.isPending || decline.isPending;

  return (
    <Card className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <p className="text-sm text-accent-200/70">
          Invite from <span className="font-mono text-accent-100">{invite.invitedBy}</span>
        </p>
        <p className="text-xs text-accent-200/50">
          Pool <span className="font-mono">{invite.poolId.slice(-6)}</span>
        </p>
      </div>
      <div className="flex gap-2">
        <Button variant="primary" onClick={onAccept} disabled={pending}>
          {accept.isPending ? 'Joining…' : 'Accept'}
        </Button>
        <Button variant="ghost" onClick={onDecline} disabled={pending}>
          {decline.isPending ? 'Declining…' : 'Decline'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </Card>
  );
};
