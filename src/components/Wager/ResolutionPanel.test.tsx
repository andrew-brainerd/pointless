import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import type { WagerDoc, WagerStatus } from '@/types/wager';

const { mockPropose, mockConfirm, mockDispute, mockAdminResolve } = vi.hoisted(() => ({
  mockPropose: vi.fn(),
  mockConfirm: vi.fn(),
  mockDispute: vi.fn(),
  mockAdminResolve: vi.fn(),
}));

vi.mock('@/queries/wagers', () => ({
  useProposeResolution: () => ({ mutateAsync: mockPropose, isPending: false }),
  useConfirmResolution: () => ({ mutateAsync: mockConfirm, isPending: false }),
  useDisputeResolution: () => ({ mutateAsync: mockDispute, isPending: false }),
  useAdminResolve: () => ({ mutateAsync: mockAdminResolve, isPending: false }),
}));

const { ResolutionPanel } = await import('./ResolutionPanel');

afterEach(() => vi.clearAllMocks());

const baseWager = (overrides: Partial<WagerDoc> = {}): WagerDoc => ({
  _id: 'w',
  poolId: 'p',
  createdBy: 'alice',
  createdAt: new Date().toISOString(),
  description: 'desc',
  options: [
    { id: 'yes', label: 'Yes' },
    { id: 'no', label: 'No' },
  ],
  closeBy: null,
  status: 'active' as WagerStatus,
  participants: [
    { uid: 'alice', optionId: 'yes', stake: 100, stakedAt: new Date().toISOString() },
    { uid: 'bob', optionId: 'no', stake: 100, stakedAt: new Date().toISOString() },
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

describe('ResolutionPanel', () => {
  it('active + staked: shows propose form, calls propose mutation', async () => {
    mockPropose.mockResolvedValueOnce(undefined);
    render(
      <ResolutionPanel
        wager={baseWager()}
        poolId="p"
        myUid="alice"
        iAmStaked
        iAmAdmin={false}
      />,
    );
    expect(screen.getByRole('heading', { name: /propose resolution/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /propose/i }));
    await vi.waitFor(() => {
      expect(mockPropose).toHaveBeenCalledWith('yes');
    });
  });

  it('active + not staked: renders nothing', () => {
    const { container } = render(
      <ResolutionPanel
        wager={baseWager()}
        poolId="p"
        myUid="carol"
        iAmStaked={false}
        iAmAdmin={false}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('pending_confirmation + non-proposer staked: shows confirm/dispute, fires confirm', async () => {
    mockConfirm.mockResolvedValueOnce(undefined);
    render(
      <ResolutionPanel
        wager={baseWager({
          status: 'pending_confirmation',
          resolution: {
            proposedBy: 'alice',
            proposedAt: new Date().toISOString(),
            optionId: 'yes',
            confirmations: [],
            disputes: [],
          },
        })}
        poolId="p"
        myUid="bob"
        iAmStaked
        iAmAdmin={false}
      />,
    );
    expect(screen.getByRole('heading', { name: /awaiting confirmation/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /^confirm$/i }));
    await vi.waitFor(() => {
      expect(mockConfirm).toHaveBeenCalled();
    });
  });

  it('pending_confirmation + proposer: shows waiting message, no action buttons', () => {
    render(
      <ResolutionPanel
        wager={baseWager({
          status: 'pending_confirmation',
          resolution: {
            proposedBy: 'alice',
            proposedAt: new Date().toISOString(),
            optionId: 'yes',
            confirmations: [],
            disputes: [],
          },
        })}
        poolId="p"
        myUid="alice"
        iAmStaked
        iAmAdmin={false}
      />,
    );
    expect(screen.getByText(/you proposed this resolution/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /confirm/i })).not.toBeInTheDocument();
  });

  it('disputed + admin: shows admin resolve UI, void button fires admin-resolve', async () => {
    mockAdminResolve.mockResolvedValueOnce(undefined);
    render(
      <ResolutionPanel
        wager={baseWager({ status: 'disputed' })}
        poolId="p"
        myUid="alice"
        iAmStaked
        iAmAdmin
      />,
    );
    expect(screen.getByRole('heading', { name: /admin: resolve dispute/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /void & refund/i }));
    await vi.waitFor(() => {
      expect(mockAdminResolve).toHaveBeenCalledWith({ void: true });
    });
  });

  it('disputed + non-admin: shows "waiting on admin" message', () => {
    render(
      <ResolutionPanel
        wager={baseWager({ status: 'disputed' })}
        poolId="p"
        myUid="bob"
        iAmStaked
        iAmAdmin={false}
      />,
    );
    expect(screen.getByText(/waiting on a pool admin/i)).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('settled: shows winner label', () => {
    render(
      <ResolutionPanel
        wager={baseWager({ status: 'settled', settledOptionId: 'yes' })}
        poolId="p"
        myUid="alice"
        iAmStaked
        iAmAdmin={false}
      />,
    );
    expect(screen.getByText(/winner:/i)).toBeInTheDocument();
    expect(screen.getByText('Yes')).toBeInTheDocument();
  });

  it('voided: shows reason', () => {
    render(
      <ResolutionPanel
        wager={baseWager({ status: 'voided', voidReason: 'cancelled' })}
        poolId="p"
        myUid="alice"
        iAmStaked={false}
        iAmAdmin={false}
      />,
    );
    expect(screen.getByText(/reason: cancelled/i)).toBeInTheDocument();
  });
});
