import type { ReactNode } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { WagerDoc, WagerStatus } from '@/types/wager';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...rest }: { children: ReactNode } & Record<string, unknown>) => (
    <a {...rest}>{children}</a>
  ),
}));

const { WagerCard } = await import('./WagerCard');

const makeWager = (overrides: Partial<WagerDoc> = {}): WagerDoc => ({
  _id: 'w-1',
  poolId: 'p-1',
  createdBy: 'alice',
  createdAt: new Date().toISOString(),
  description: 'Will it rain?',
  options: [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ],
  closeBy: null,
  status: 'active' as WagerStatus,
  participants: [
    { uid: 'alice', optionId: 'yes', stake: 100, stakedAt: new Date().toISOString() },
    { uid: 'bob', optionId: 'no', stake: 200, stakedAt: new Date().toISOString() },
  ],
  invitedUids: [],
  declinedUids: [],
  resolution: null,
  settledAt: null,
  settledOptionId: null,
  voidedAt: null,
  voidReason: null,
  ...overrides,
});

describe('WagerCard', () => {
  it('renders description, status badge, and total pot', () => {
    render(<WagerCard wager={makeWager()} />);
    expect(screen.getByText(/will it rain/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText('300')).toBeInTheDocument();
  });

  it('uses the right badge label for each status', () => {
    const { rerender } = render(<WagerCard wager={makeWager({ status: 'pending_confirmation' })} />);
    expect(screen.getByText(/awaiting confirm/i)).toBeInTheDocument();
    rerender(<WagerCard wager={makeWager({ status: 'settled' })} />);
    expect(screen.getByText(/settled/i)).toBeInTheDocument();
    rerender(<WagerCard wager={makeWager({ status: 'disputed' })} />);
    expect(screen.getByText(/disputed/i)).toBeInTheDocument();
  });
});
