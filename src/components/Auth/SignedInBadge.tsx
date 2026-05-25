import { signOut } from 'firebase/auth';
import { getFirebaseAuth } from '@/auth/firebase';
import { useAuth } from '@/auth/useAuth';

export const SignedInBadge = () => {
  const { user } = useAuth();
  if (!user) return null;

  const handleSignOut = () => {
    void signOut(getFirebaseAuth());
  };

  return (
    <div className="flex items-center gap-3 rounded-full bg-canvas-bottom/40 px-3 py-2 backdrop-blur">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt=""
          className="h-8 w-8 rounded-full border border-accent-200/30"
        />
      ) : (
        <div className="grid h-8 w-8 place-items-center rounded-full bg-accent-600 text-sm font-semibold uppercase">
          {(user.displayName ?? user.email ?? '?').slice(0, 1)}
        </div>
      )}
      <span className="text-sm">{user.displayName ?? user.email}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="rounded-full border border-accent-200/30 px-3 py-1 text-xs text-accent-100 hover:bg-accent-900/40"
      >
        Sign out
      </button>
    </div>
  );
};
