import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useCreateInvite } from '@/queries/pools';

interface InviteFormProps {
  poolId: string;
}

export const InviteForm = ({ poolId }: InviteFormProps) => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState<{ kind: 'ok' | 'error'; text: string } | null>(null);
  const mutation = useCreateInvite(poolId);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setMessage(null);
    try {
      const res = await mutation.mutateAsync({ invitedEmail: trimmed });
      const ok =
        res.status === 'created'
          ? `Invite sent to ${trimmed}.`
          : res.status === 'already_invited'
            ? `${trimmed} already has a pending invite.`
            : `${trimmed} is already a member.`;
      setMessage({ kind: 'ok', text: ok });
      setEmail('');
    } catch (err) {
      setMessage({
        kind: 'error',
        text: err instanceof Error ? err.message : 'Failed to send invite',
      });
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">Invite</h2>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="email"
          placeholder="friend@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoComplete="off"
        />
        <Button type="submit" disabled={mutation.isPending || !email.trim()}>
          {mutation.isPending ? 'Sending…' : 'Send invite'}
        </Button>
      </div>
      {message && (
        <p
          className={
            message.kind === 'ok' ? 'text-xs text-accent-200/80' : 'text-xs text-red-300'
          }
        >
          {message.text}
        </p>
      )}
    </form>
  );
};
