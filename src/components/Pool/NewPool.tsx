import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { AppHeader } from '@/components/AppShell/AppHeader';
import { Button } from '@/components/common/Button';
import { Card } from '@/components/common/Card';
import { Input } from '@/components/common/Input';
import { useCreatePool } from '@/queries/pools';

export const NewPool = () => {
  const navigate = useNavigate();
  const create = useCreatePool();
  const [name, setName] = useState('');
  const [startingPoints, setStartingPoints] = useState('500');
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Pool name is required');
      return;
    }
    const points = Number(startingPoints);
    if (!Number.isInteger(points) || points <= 0) {
      setError('Starting points must be a positive integer');
      return;
    }
    try {
      const pool = await create.mutateAsync({ name: trimmed, startingPoints: points });
      void navigate({ to: '/pools/$poolId', params: { poolId: pool._id } });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create pool');
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col gap-6 px-6 py-8">
        <h1 className="text-3xl font-semibold">New pool</h1>
        <Card>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-accent-200/70">Pool name</span>
              <Input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Friday Night Football"
                required
                maxLength={80}
                autoFocus
              />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-xs text-accent-200/70">
                Starting points per member
                <span className="ml-1 text-accent-200/50">(default 500)</span>
              </span>
              <Input
                type="number"
                min={1}
                value={startingPoints}
                onChange={e => setStartingPoints(e.target.value)}
                required
              />
            </label>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" type="button" onClick={() => navigate({ to: '/' })}>
                Cancel
              </Button>
              <Button type="submit" disabled={create.isPending}>
                {create.isPending ? 'Creating…' : 'Create pool'}
              </Button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
        </Card>
      </main>
    </div>
  );
};
