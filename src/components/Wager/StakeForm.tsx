import { useState } from 'react';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useStakeOnWager } from '@/queries/wagers';
import type { WagerDoc } from '@/types/wager';

interface StakeFormProps {
  wager: WagerDoc;
  poolId: string;
  available: number;
}

export const StakeForm = ({ wager, poolId, available }: StakeFormProps) => {
  const stake = useStakeOnWager(poolId, wager._id);
  const [optionId, setOptionId] = useState<string>(wager.options[0]?.id ?? '');
  const [amount, setAmount] = useState('10');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const n = Number(amount);
    if (!Number.isInteger(n) || n <= 0) {
      setError('Stake must be a positive integer');
      return;
    }
    if (n > available) {
      setError(`Stake (${n}) exceeds available balance (${available})`);
      return;
    }
    if (!optionId) {
      setError('Pick an option');
      return;
    }
    try {
      await stake.mutateAsync({ optionId, stake: n });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stake');
    }
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 text-sm">
        <span className="text-xs text-accent-200/70">Pick an option</span>
        {wager.options.map(o => (
          <label key={o.id} className="flex items-center gap-2">
            <input
              type="radio"
              name="stakeOption"
              value={o.id}
              checked={optionId === o.id}
              onChange={() => setOptionId(o.id)}
              className="size-4 accent-accent-500"
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-xs text-accent-200/70">
          Stake (available: {available} pts)
        </span>
        <Input
          type="number"
          min={1}
          max={available}
          value={amount}
          onChange={e => setAmount(e.target.value)}
          required
        />
      </label>
      <div className="flex justify-end">
        <Button type="submit" disabled={stake.isPending || available <= 0}>
          {stake.isPending ? 'Staking…' : 'Stake'}
        </Button>
      </div>
      {error && <p className="text-xs text-red-300">{error}</p>}
    </form>
  );
};
