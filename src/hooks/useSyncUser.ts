import { useEffect, useRef } from 'react';
import { useMutation } from '@tanstack/react-query';
import { syncUser } from '@/api/users';
import { useAuth } from '@/auth/useAuth';

// On first sign-in for each uid, idempotently provision the user in our DB
// via POST /users/sync. Fires once per uid per session (re-fires if the uid
// changes — e.g. user signs out and back in as someone else).
export const useSyncUser = (): void => {
  const { user, status } = useAuth();
  const syncedUidRef = useRef<string | null>(null);
  const mutation = useMutation({
    mutationFn: () =>
      syncUser({
        displayName: user?.displayName ?? undefined,
        photoURL: user?.photoURL ?? null,
      }),
  });

  useEffect(() => {
    if (status !== 'signed-in' || !user) return;
    if (syncedUidRef.current === user.uid) return;
    syncedUidRef.current = user.uid;
    mutation.mutate();
  }, [status, user, mutation]);
};
