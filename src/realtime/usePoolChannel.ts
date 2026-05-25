import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getPusherClient } from './pusher';
import { poolInvitesKey, poolKey } from '@/queries/pools';
import { poolWagersKey, wagerKey } from '@/queries/wagers';

interface WagerEventData {
  wagerId?: string;
}

// Subscribes to private-pool-<poolId>. Pool, pool-invites, pool-wagers, and
// (when the event carries a wagerId) per-wager queries are invalidated.
export const usePoolChannel = (poolId: string | undefined): void => {
  const qc = useQueryClient();

  useEffect(() => {
    if (!poolId) return;
    const client = getPusherClient();
    if (!client) return;

    const name = `private-pool-${poolId}`;
    const channel = client.subscribe(name);

    const refreshPool = () => {
      void qc.invalidateQueries({ queryKey: poolKey(poolId) });
      void qc.invalidateQueries({ queryKey: poolInvitesKey(poolId) });
    };
    const refreshWagers = (data: unknown) => {
      void qc.invalidateQueries({ queryKey: poolWagersKey(poolId) });
      void qc.invalidateQueries({ queryKey: poolKey(poolId) });
      const wagerId = (data as WagerEventData | undefined)?.wagerId;
      if (wagerId) {
        void qc.invalidateQueries({ queryKey: wagerKey(wagerId) });
      }
    };

    channel.bind('member.joined', refreshPool);
    channel.bind('member.left', refreshPool);
    channel.bind('wager.created', refreshWagers);
    channel.bind('wager.staked', refreshWagers);
    channel.bind('wager.resolution.proposed', refreshWagers);
    channel.bind('wager.settled', refreshWagers);
    channel.bind('wager.disputed', refreshWagers);
    channel.bind('wager.voided', refreshWagers);

    return () => {
      channel.unbind_all();
      client.unsubscribe(name);
    };
  }, [poolId, qc]);
};
