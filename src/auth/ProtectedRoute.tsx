import { type ReactNode } from 'react';
import { useAuth } from './useAuth';
import { isFirebaseConfigured } from './firebase';
import { SetupNeeded } from '@/components/Auth/SetupNeeded';
import { SignIn } from '@/components/Auth/SignIn';
import { Loading } from '@/components/common/Loading';
import { useUserChannel } from '@/realtime/useUserChannel';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status, user } = useAuth();
  // Subscribe to per-user Pusher channel for the duration the user is signed in.
  useUserChannel(status === 'signed-in' ? user?.uid : undefined);

  if (!isFirebaseConfigured()) return <SetupNeeded />;
  if (status === 'configuring' || status === 'loading') return <Loading />;
  if (status === 'signed-out') return <SignIn />;
  return <>{children}</>;
};
