import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAcceptInvite, useDeclineInvite, useMyInvites } from '@/queries/invites';
import { AppHeader } from '@/components/AppShell/AppHeader';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Loading } from '@/components/common/Loading';

interface InvitePageProps {
  inviteId: string;
}

export const InvitePage = ({ inviteId }: InvitePageProps) => {
  const navigate = useNavigate();
  const invitesQuery = useMyInvites();
  const accept = useAcceptInvite();
  const decline = useDeclineInvite();
  const [error, setError] = useState<string | null>(null);

  if (invitesQuery.isLoading) return <Loading />;

  const invite = invitesQuery.data?.find(i => i._id === inviteId);

  if (!invite) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
          <h1 className="text-2xl font-semibold">Invite not found</h1>
          <p className="text-sm text-accent-200/70">
            This invite has been resolved, revoked, or belongs to a different account.
          </p>
          <Button onClick={() => void navigate({ to: '/' })}>Go home</Button>
        </main>
      </div>
    );
  }

  const onAccept = async () => {
    setError(null);
    try {
      const { pool } = await accept.mutateAsync(invite._id);
      void navigate({ to: '/pools/$poolId', params: { poolId: pool._id } });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };
  const onDecline = async () => {
    setError(null);
    try {
      await decline.mutateAsync(invite._id);
      void navigate({ to: '/' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-4 px-6 py-12 text-center">
        <h1 className="text-3xl font-semibold">You're invited</h1>
        <Card className="flex flex-col gap-4 text-left">
          <p className="text-sm text-accent-200/80">
            Invited by <span className="font-mono text-accent-100">{invite.invitedBy}</span>
          </p>
          <p className="text-sm text-accent-200/80">
            Pool ID: <span className="font-mono">{invite.poolId}</span>
          </p>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={onDecline} disabled={decline.isPending}>
              {decline.isPending ? 'Declining…' : 'Decline'}
            </Button>
            <Button onClick={onAccept} disabled={accept.isPending}>
              {accept.isPending ? 'Joining…' : 'Accept'}
            </Button>
          </div>
          {error && <p className="text-sm text-red-300">{error}</p>}
        </Card>
      </main>
    </div>
  );
};
