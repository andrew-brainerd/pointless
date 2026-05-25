import { type ReactNode } from 'react';
import { useAuth } from './useAuth';
import { isFirebaseConfigured } from './firebase';
import { SetupNeeded } from '@/components/Auth/SetupNeeded';
import { SignIn } from '@/components/Auth/SignIn';
import { Loading } from '@/components/common/Loading';

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { status } = useAuth();

  if (!isFirebaseConfigured()) return <SetupNeeded />;
  if (status === 'configuring' || status === 'loading') return <Loading />;
  if (status === 'signed-out') return <SignIn />;
  return <>{children}</>;
};
