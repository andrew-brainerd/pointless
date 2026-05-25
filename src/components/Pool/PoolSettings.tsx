import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from '@/components/common/Button';
import { Input } from '@/components/common/Input';
import { useDeletePool, useUpdatePool } from '@/queries/pools';
import type { PoolDoc } from '@/types/pool';

interface PoolSettingsProps {
  pool: PoolDoc;
}

export const PoolSettings = ({ pool }: PoolSettingsProps) => {
  const navigate = useNavigate();
  const update = useUpdatePool(pool._id);
  const del = useDeletePool(pool._id);
  const [name, setName] = useState(pool.name);
  const [startingPoints, setStartingPoints] = useState(String(pool.startingPoints));
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const dirty = name !== pool.name || Number(startingPoints) !== pool.startingPoints;

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const parsed = Number(startingPoints);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      setError('Starting points must be a positive integer');
      return;
    }
    try {
      await update.mutateAsync({ name, startingPoints: parsed });
      setSavedAt(Date.now());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    }
  };

  const onDelete = async () => {
    if (!window.confirm(`Delete the "${pool.name}" pool? This cannot be undone.`)) return;
    setError(null);
    try {
      await del.mutateAsync();
      void navigate({ to: '/' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  return (
    <section className="flex flex-col gap-4">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
        Admin settings
      </h2>
      <form onSubmit={onSave} className="flex flex-col gap-3">
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-accent-200/70">Pool name</span>
          <Input value={name} onChange={e => setName(e.target.value)} required maxLength={80} />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="text-xs text-accent-200/70">
            Starting points for new joiners
            <span className="ml-1 text-accent-200/50">(does not affect existing members)</span>
          </span>
          <Input
            type="number"
            min={1}
            value={startingPoints}
            onChange={e => setStartingPoints(e.target.value)}
            required
          />
        </label>
        <div className="flex items-center gap-2">
          <Button type="submit" disabled={!dirty || update.isPending}>
            {update.isPending ? 'Saving…' : 'Save'}
          </Button>
          {savedAt && !dirty && (
            <span className="text-xs text-accent-200/70">Saved.</span>
          )}
        </div>
      </form>
      <div className="flex flex-col gap-2 border-t border-accent-200/10 pt-4">
        <Button variant="danger" onClick={onDelete} disabled={del.isPending}>
          {del.isPending ? 'Deleting…' : 'Delete pool'}
        </Button>
      </div>
      {error && <p className="text-sm text-red-300">{error}</p>}
    </section>
  );
};
