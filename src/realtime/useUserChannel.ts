import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPusherClient } from './pusher';
import { notificationsKey } from '@/queries/notifications';
import { myInvitesKey } from '@/queries/invites';
import { poolsKey } from '@/queries/pools';

// Subscribes to private-user-<uid> for the duration of the hook's lifecycle.
// Invalidates notification + invite + pool queries on relevant events so the
// UI updates without polling.
export const useUserChannel = (uid: string | undefined): void => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!uid) return;
    const client = getPusherClient();
    if (!client) return;

    const name = `private-user-${uid}`;
    const channel = client.subscribe(name);
    const refreshNotifs = () => {
      void qc.invalidateQueries({ queryKey: notificationsKey });
    };
    const refreshInvites = () => {
      void qc.invalidateQueries({ queryKey: myInvitesKey });
      void qc.invalidateQueries({ queryKey: poolsKey });
    };

    channel.bind('notification.created', refreshNotifs);
    channel.bind('invite.received', refreshInvites);
    channel.bind('invite.resolved', refreshInvites);

    return () => {
      channel.unbind_all();
      client.unsubscribe(name);
    };
  }, [uid, qc]);
};
