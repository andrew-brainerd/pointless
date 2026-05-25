import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { acceptInvite, declineInvite, listMyInvites } from '@/api/invites';
import { poolsKey } from './pools';

export const myInvitesKey = ['invites', 'mine'] as const;

export const useMyInvites = () =>
  useQuery({
    queryKey: myInvitesKey,
    queryFn: () => listMyInvites().then(r => r.invites),
  });

export const useAcceptInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => acceptInvite(inviteId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: myInvitesKey });
      void qc.invalidateQueries({ queryKey: poolsKey });
    },
  });
};

export const useDeclineInvite = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => declineInvite(inviteId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: myInvitesKey });
    },
  });
};
