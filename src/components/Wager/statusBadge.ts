import type { WagerStatus } from '@/types/wager';

const labels: Record<WagerStatus, string> = {
  proposed: 'Proposed',
  active: 'Active',
  pending_confirmation: 'Awaiting confirm',
  disputed: 'Disputed',
  settled: 'Settled',
  voided: 'Voided',
};

const classes: Record<WagerStatus, string> = {
  proposed: 'bg-accent-900/60 text-accent-100',
  active: 'bg-accent-500/40 text-white',
  pending_confirmation: 'bg-yellow-500/30 text-yellow-100',
  disputed: 'bg-red-500/30 text-red-100',
  settled: 'bg-emerald-500/30 text-emerald-100',
  voided: 'bg-zinc-500/30 text-zinc-200',
};

export const statusLabel = (status: WagerStatus): string => labels[status];
export const statusClasses = (status: WagerStatus): string => classes[status];
