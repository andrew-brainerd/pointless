import { Link } from '@tanstack/react-router';
import { useAuth } from '@/auth/useAuth';
import { Card } from '@/components/common/Card';
import type { PoolDoc } from '@/types/pool';

interface PoolCardProps {
  pool: PoolDoc;
}

export const PoolCard = ({ pool }: PoolCardProps) => {
  const { user } = useAuth();
  const me = user ? pool.members[user.uid] : undefined;
  const memberCount = Object.keys(pool.members).length;

  return (
    <Link
      to="/pools/$poolId"
      params={{ poolId: pool._id }}
      className="block transition hover:scale-[1.01]"
    >
      <Card className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="text-lg font-semibold">{pool.name}</h3>
          {me?.role === 'admin' && (
            <span className="rounded-full bg-accent-500/30 px-2 py-0.5 text-xs font-medium text-accent-100">
              admin
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-4 text-sm text-accent-200/80">
          <span>
            <span className="font-mono text-base text-white">{me?.balance ?? 0}</span> pts
          </span>
          <span>
            {memberCount} member{memberCount === 1 ? '' : 's'}
          </span>
        </div>
      </Card>
    </Link>
  );
};
