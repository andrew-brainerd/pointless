import { onAuthStateChanged, type User } from 'firebase/auth';
import { create } from 'zustand';
import { getFirebaseAuth, isFirebaseConfigured } from './firebase';

export type AuthStatus = 'configuring' | 'loading' | 'signed-out' | 'signed-in';

interface AuthState {
  status: AuthStatus;
  user: User | null;
  setUser: (u: User | null) => void;
}

export const useAuthStore = create<AuthState>(set => ({
  status: isFirebaseConfigured() ? 'loading' : 'configuring',
  user: null,
  setUser: u => set({ user: u, status: u ? 'signed-in' : 'signed-out' }),
}));

let listenerStarted = false;
export const initAuthListener = (): void => {
  if (listenerStarted) return;
  if (!isFirebaseConfigured()) return;
  listenerStarted = true;
  onAuthStateChanged(getFirebaseAuth(), user => {
    useAuthStore.getState().setUser(user);
  });
};

export const useAuth = (): {
  status: AuthStatus;
  user: User | null;
} => {
  const status = useAuthStore(s => s.status);
  const user = useAuthStore(s => s.user);
  return { status, user };
};
