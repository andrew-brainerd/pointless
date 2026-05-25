import { Link } from '@tanstack/react-router';
import { Card } from '@/components/common/Card';
import { statusClasses, statusLabel } from './statusBadge';
import type { WagerDoc } from '@/types/wager';

interface WagerCardProps {
  wager: WagerDoc;
}

export const WagerCard = ({ wager }: WagerCardProps) => {
  const totalPot = wager.participants.reduce((s, p) => s + p.stake, 0);
  return (
    <Link
      to="/wagers/$wagerId"
      params={{ wagerId: wager._id }}
      className="block transition hover:scale-[1.005]"
    >
      <Card className="flex flex-col gap-2">
        <div className="flex items-baseline justify-between gap-3">
          <p className="line-clamp-2 text-sm">{wager.description}</p>
          <span
            className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses(
              wager.status,
            )}`}
          >
            {statusLabel(wager.status)}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs text-accent-200/70">
          <span>
            {wager.participants.length} staked · {wager.options.length} option
            {wager.options.length === 1 ? '' : 's'}
          </span>
          <span>
            <span className="font-mono text-white">{totalPot}</span> pts in pot
          </span>
        </div>
      </Card>
    </Link>
  );
};
