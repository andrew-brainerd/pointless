import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Home } from './Home';

vi.mock('@/auth/firebase', () => ({
  isFirebaseConfigured: vi.fn(() => true),
  getFirebaseAuth: vi.fn(),
}));
vi.mock('@/auth/useAuth', () => ({
  useAuth: vi.fn(),
  initAuthListener: vi.fn(),
}));
vi.mock('@/hooks/useSyncUser', () => ({ useSyncUser: vi.fn() }));

const { useAuth } = await import('@/auth/useAuth');

afterEach(() => {
  vi.clearAllMocks();
});

describe('Home', () => {
  it('greets the signed-in user by first name', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'signed-in',
      user: {
        uid: 'u-1',
        email: 'alice@example.com',
        displayName: 'Alice Adams',
        photoURL: null,
      } as never,
    });
    render(<Home />);
    expect(screen.getByRole('heading', { name: /welcome, alice/i })).toBeInTheDocument();
  });

  it('renders the phase status line', () => {
    vi.mocked(useAuth).mockReturnValue({
      status: 'signed-in',
      user: { uid: 'u', email: 'x@y.z', displayName: null, photoURL: null } as never,
    });
    render(<Home />);
    expect(screen.getByText(/Phase B in progress/i)).toBeInTheDocument();
  });
});
