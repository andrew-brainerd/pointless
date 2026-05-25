import { afterEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProtectedRoute } from './ProtectedRoute';

vi.mock('./firebase', () => ({
  isFirebaseConfigured: vi.fn(),
  getFirebaseAuth: vi.fn(),
}));
vi.mock('./useAuth', () => ({
  useAuth: vi.fn(),
  initAuthListener: vi.fn(),
}));
vi.mock('@/realtime/useUserChannel', () => ({ useUserChannel: vi.fn() }));

const { isFirebaseConfigured } = await import('./firebase');
const { useAuth } = await import('./useAuth');

const ChildMarker = () => <span>protected content</span>;

afterEach(() => {
  vi.clearAllMocks();
});

describe('ProtectedRoute', () => {
  it('renders SetupNeeded when Firebase is not configured', () => {
    vi.mocked(isFirebaseConfigured).mockReturnValue(false);
    vi.mocked(useAuth).mockReturnValue({ status: 'configuring', user: null });
    render(
      <ProtectedRoute>
        <ChildMarker />
      </ProtectedRoute>,
    );
    expect(screen.getByRole('heading', { name: /setup needed/i })).toBeInTheDocument();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });

  it('renders the Loading state while auth is resolving', () => {
    vi.mocked(isFirebaseConfigured).mockReturnValue(true);
    vi.mocked(useAuth).mockReturnValue({ status: 'loading', user: null });
    render(
      <ProtectedRoute>
        <ChildMarker />
      </ProtectedRoute>,
    );
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });

  it('renders SignIn when signed out', () => {
    vi.mocked(isFirebaseConfigured).mockReturnValue(true);
    vi.mocked(useAuth).mockReturnValue({ status: 'signed-out', user: null });
    render(
      <ProtectedRoute>
        <ChildMarker />
      </ProtectedRoute>,
    );
    expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
  });

  it('renders children when signed in', () => {
    vi.mocked(isFirebaseConfigured).mockReturnValue(true);
    vi.mocked(useAuth).mockReturnValue({
      status: 'signed-in',
      user: { uid: 'u', email: 'a@b.c', displayName: 'A', photoURL: null } as never,
    });
    render(
      <ProtectedRoute>
        <ChildMarker />
      </ProtectedRoute>,
    );
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
