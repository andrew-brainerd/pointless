import type { ReactNode } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import type { PoolDoc } from '@/types/pool';

vi.mock('@tanstack/react-router', () => ({
  Link: ({ children, ...rest }: { children: ReactNode } & Record<string, unknown>) => (
    <a {...rest}>{children}</a>
  ),
  useNavigate: () => () => undefined,
}));
vi.mock('@/hooks/useSyncUser', () => ({ useSyncUser: vi.fn() }));
vi.mock('@/auth/firebase', () => ({
  isFirebaseConfigured: () => true,
  getFirebaseAuth: () => ({ currentUser: null }),
}));
vi.mock('@/auth/useAuth', () => ({
  useAuth: vi.fn(() => ({ status: 'signed-in', user: { uid: 'u-1' } })),
  initAuthListener: vi.fn(),
}));
vi.mock('@/queries/pools', () => ({
  useMyPools: vi.fn(),
}));
vi.mock('@/queries/invites', () => ({
  useMyInvites: vi.fn(() => ({ data: [], isLoading: false })),
}));

const { Home } = await import('./Home');
const { useMyPools: useMyPoolsImported } = await import('@/queries/pools');

afterEach(() => {
  vi.clearAllMocks();
});

describe('Home', () => {
  it('shows the empty state when the user has no pools', () => {
    vi.mocked(useMyPoolsImported).mockReturnValue({ data: [], isLoading: false } as never);
    render(<Home />);
    expect(screen.getByText(/no pools yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new pool/i })).toBeInTheDocument();
  });

  it('lists my pools when present', () => {
    const pool: PoolDoc = {
      _id: 'pool-1',
      name: 'Friday Football',
      createdBy: 'u-1',
      createdAt: new Date().toISOString(),
      startingPoints: 500,
      members: {
        'u-1': {
          role: 'admin',
          balance: 500,
          pending: 0,
          joinedAt: new Date().toISOString(),
        },
      },
      memberUids: ['u-1'],
    };
    vi.mocked(useMyPoolsImported).mockReturnValue({ data: [pool], isLoading: false } as never);
    render(<Home />);
    expect(screen.getByRole('heading', { name: /friday football/i })).toBeInTheDocument();
    expect(screen.getByText(/admin/i)).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    vi.mocked(useMyPoolsImported).mockReturnValue({ data: undefined, isLoading: true } as never);
    render(<Home />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
