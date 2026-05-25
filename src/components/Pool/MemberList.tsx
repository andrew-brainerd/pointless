import { useState } from 'react';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/common/Button';
import { useRemoveMember, useSetMemberRole } from '@/queries/pools';
import type { MemberRole, PoolDoc } from '@/types/pool';

interface MemberListProps {
  pool: PoolDoc;
}

export const MemberList = ({ pool }: MemberListProps) => {
  const { user } = useAuth();
  const myUid = user?.uid ?? '';
  const meIsAdmin = pool.members[myUid]?.role === 'admin';
  const adminCount = Object.values(pool.members).filter(m => m.role === 'admin').length;

  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
        Members · {pool.memberUids.length}
      </h2>
      <ul className="flex flex-col divide-y divide-accent-200/10 rounded-xl border border-accent-200/15">
        {Object.entries(pool.members).map(([uid, member]) => (
          <MemberRow
            key={uid}
            poolId={pool._id}
            uid={uid}
            role={member.role}
            balance={member.balance}
            pending={member.pending}
            isMe={uid === myUid}
            meIsAdmin={meIsAdmin}
            isLastAdmin={member.role === 'admin' && adminCount === 1}
          />
        ))}
      </ul>
    </section>
  );
};

interface MemberRowProps {
  poolId: string;
  uid: string;
  role: MemberRole;
  balance: number;
  pending: number;
  isMe: boolean;
  meIsAdmin: boolean;
  isLastAdmin: boolean;
}

const MemberRow = ({
  poolId,
  uid,
  role,
  balance,
  pending,
  isMe,
  meIsAdmin,
  isLastAdmin,
}: MemberRowProps) => {
  const remove = useRemoveMember(poolId);
  const setRole = useSetMemberRole(poolId);
  const [error, setError] = useState<string | null>(null);

  const onRemove = async () => {
    setError(null);
    try {
      await remove.mutateAsync(uid);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };
  const onToggleRole = async () => {
    setError(null);
    try {
      await setRole.mutateAsync({ uid, role: role === 'admin' ? 'member' : 'admin' });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed');
    }
  };

  const showAdminActions = meIsAdmin && !isMe;
  const pendingMutation = remove.isPending || setRole.isPending;

  return (
    <li className="flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <span className="font-mono text-sm text-accent-100">
          {uid.slice(0, 8)}
          {uid.length > 8 ? '…' : ''}
        </span>
        {isMe && (
          <span className="rounded-full bg-accent-500/30 px-2 py-0.5 text-xs text-accent-100">
            you
          </span>
        )}
        <span className="rounded-full border border-accent-200/20 px-2 py-0.5 text-xs uppercase text-accent-200/80">
          {role}
        </span>
      </div>
      <div className="flex items-center gap-4 text-sm">
        <span>
          <span className="font-mono">{balance}</span>
          {pending > 0 && (
            <span className="ml-1 text-accent-200/60">(+{pending} pending)</span>
          )}
        </span>
        {showAdminActions && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              onClick={onToggleRole}
              disabled={pendingMutation || (role === 'admin' && isLastAdmin)}
              title={role === 'admin' && isLastAdmin ? 'Cannot demote the last admin' : undefined}
            >
              {role === 'admin' ? 'Demote' : 'Promote'}
            </Button>
            <Button variant="danger" onClick={onRemove} disabled={pendingMutation || isLastAdmin}>
              Remove
            </Button>
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </li>
  );
};
