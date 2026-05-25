import { Link } from '@tanstack/react-router';
import { Button } from '@/components/common/Button';
import { WagerCard } from '@/components/Wager/WagerCard';
import { usePoolWagers } from '@/queries/wagers';

interface WagersListProps {
  poolId: string;
}

export const WagersList = ({ poolId }: WagersListProps) => {
  const wagersQuery = usePoolWagers(poolId);
  const wagers = wagersQuery.data ?? [];

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
          Wagers · {wagers.length}
        </h2>
        <Link to="/pools/$poolId/wagers/new" params={{ poolId }}>
          <Button variant="primary">New wager</Button>
        </Link>
      </div>
      {wagersQuery.isLoading && <p className="text-sm text-accent-200/60">Loading…</p>}
      {!wagersQuery.isLoading && wagers.length === 0 && (
        <p className="text-sm text-accent-200/60">No wagers yet.</p>
      )}
      {wagers.length > 0 && (
        <ul className="flex flex-col gap-3">
          {wagers.map(w => (
            <li key={w._id}>
              <WagerCard wager={w} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};
