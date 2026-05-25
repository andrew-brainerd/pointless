import { useMemo, useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/auth/useAuth';
import { AppHeader } from '@/components/AppShell/AppHeader';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { Loading } from '@/components/common/Loading';
import { usePool } from '@/queries/pools';
import { useCreateWager } from '@/queries/wagers';
import type { WagerOption } from '@/types/wager';

const slugify = (label: string, fallback: string): string => {
  const slug = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 32);
  return slug || fallback;
};

interface NewWagerFormProps {
  poolId: string;
}

export const NewWagerForm = ({ poolId }: NewWagerFormProps) => {
  const navigate = useNavigate();
  const poolQuery = usePool(poolId);
  const { user } = useAuth();
  const create = useCreateWager(poolId);

  const [description, setDescription] = useState('');
  const [optionLabels, setOptionLabels] = useState<string[]>(['Yes', 'No']);
  const [myOptionIdx, setMyOptionIdx] = useState(0);
  const [stake, setStake] = useState('10');
  const [error, setError] = useState<string | null>(null);

  // Live-derived option IDs from labels (stable while editing — index used as fallback).
  const options = useMemo<WagerOption[]>(
    () => optionLabels.map((label, i) => ({ id: slugify(label, `opt-${i}`), label })),
    [optionLabels],
  );

  if (poolQuery.isLoading) return <Loading />;
  if (poolQuery.isError || !poolQuery.data) {
    return (
      <div className="flex min-h-screen flex-col">
        <AppHeader />
        <main className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-accent-100">Pool not found.</p>
        </main>
      </div>
    );
  }
  const pool = poolQuery.data;
  const me = user ? pool.members[user.uid] : undefined;
  const available = me ? me.balance - me.pending : 0;

  const addOption = () => {
    if (optionLabels.length >= 10) return;
    setOptionLabels(prev => [...prev, '']);
  };
  const removeOption = (idx: number) => {
    if (optionLabels.length <= 2) return;
    setOptionLabels(prev => prev.filter((_, i) => i !== idx));
    if (myOptionIdx >= idx && myOptionIdx > 0) {
      setMyOptionIdx(m => Math.max(0, m - 1));
    }
  };
  const updateOption = (idx: number, value: string) => {
    setOptionLabels(prev => prev.map((l, i) => (i === idx ? value : l)));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedDesc = description.trim();
    if (!trimmedDesc) {
      setError('Description is required');
      return;
    }
    if (options.some(o => !o.label.trim())) {
      setError('All options must have a label');
      return;
    }
    const ids = new Set(options.map(o => o.id));
    if (ids.size !== options.length) {
      setError('Option labels must be distinguishable (each generates a unique id)');
      return;
    }
    const stakeNum = Number(stake);
    if (!Number.isInteger(stakeNum) || stakeNum <= 0) {
      setError('Stake must be a positive integer');
      return;
    }
    if (stakeNum > available) {
      setError(`Stake (${stakeNum}) exceeds available balance (${available})`);
      return;
    }
    const myOption = options[myOptionIdx];
    if (!myOption) {
      setError('Pick which option you back');
      return;
    }
    try {
      const wager = await create.mutateAsync({
        description: trimmedDesc,
        options,
        myOptionId: myOption.id,
        myStake: stakeNum,
      });
      void navigate({ to: '/wagers/$wagerId', params: { wagerId: wager._id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create wager');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col gap-6 px-6 py-8">
        <header>
          <h1 className="text-3xl font-semibold">New wager</h1>
          <p className="text-sm text-accent-200/70">in {pool.name}</p>
        </header>
        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-5">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-accent-200/70">Description</span>
              <Input
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Will the Lions win Sunday?"
                required
                maxLength={500}
                autoFocus
              />
            </label>

            <div className="flex flex-col gap-2 text-sm">
              <span className="text-xs text-accent-200/70">
                Options ({optionLabels.length}/10)
              </span>
              {optionLabels.map((label, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="myOption"
                    checked={myOptionIdx === i}
                    onChange={() => setMyOptionIdx(i)}
                    className="size-4 accent-accent-500"
                    aria-label={`Back option ${i + 1}`}
                  />
                  <Input
                    value={label}
                    onChange={e => updateOption(i, e.target.value)}
                    placeholder={`Option ${i + 1}`}
                    required
                    maxLength={80}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => removeOption(i)}
                    disabled={optionLabels.length <= 2}
                    aria-label={`Remove option ${i + 1}`}
                    className="px-3"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {optionLabels.length < 10 && (
                <Button type="button" variant="ghost" onClick={addOption} className="self-start">
                  + Add option
                </Button>
              )}
              <p className="text-xs text-accent-200/50">
                The radio marks which option you're backing.
              </p>
            </div>

            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-accent-200/70">
                My stake
                <span className="ml-1 text-accent-200/50">(available: {available} pts)</span>
              </span>
              <Input
                type="number"
                min={1}
                max={available}
                value={stake}
                onChange={e => setStake(e.target.value)}
                required
              />
            </label>

            <p className="text-xs text-accent-200/60">
              Everyone in this pool will be invited. Specific invites are TBD (OQ-12).
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => navigate({ to: '/pools/$poolId', params: { poolId } })}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating…' : 'Create wager'}
              </Button>
            </div>
            {error && <p className="text-sm text-red-300">{error}</p>}
          </form>
        </Card>
      </main>
    </div>
  );
};
