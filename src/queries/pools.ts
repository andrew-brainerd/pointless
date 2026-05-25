import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createInvite,
  createPool,
  deletePool,
  getPool,
  leavePool,
  listPoolInvites,
  listPools,
  removeMember,
  revokeInvite,
  setMemberRole,
  updatePool,
  type CreatePoolInput,
  type InviteInput,
  type UpdatePoolInput,
} from '@/api/pools';
import type { MemberRole } from '@/types/pool';

export const poolsKey = ['pools'] as const;
export const poolKey = (poolId: string) => ['pool', poolId] as const;
export const poolInvitesKey = (poolId: string) => ['pool', poolId, 'invites'] as const;

export const useMyPools = () =>
  useQuery({
    queryKey: poolsKey,
    queryFn: () => listPools().then(r => r.pools),
  });

export const usePool = (poolId: string | undefined) =>
  useQuery({
    queryKey: poolKey(poolId ?? ''),
    queryFn: () => getPool(poolId!).then(r => r.pool),
    enabled: Boolean(poolId),
  });

export const usePoolInvites = (poolId: string | undefined) =>
  useQuery({
    queryKey: poolInvitesKey(poolId ?? ''),
    queryFn: () => listPoolInvites(poolId!).then(r => r.invites),
    enabled: Boolean(poolId),
  });

export const useCreatePool = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePoolInput) => createPool(input).then(r => r.pool),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: poolsKey });
    },
  });
};

export const useUpdatePool = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (patch: UpdatePoolInput) => updatePool(poolId, patch).then(r => r.pool),
    onSuccess: pool => {
      qc.setQueryData(poolKey(poolId), pool);
      void qc.invalidateQueries({ queryKey: poolsKey });
    },
  });
};

export const useDeletePool = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => deletePool(poolId),
    onSuccess: () => {
      qc.removeQueries({ queryKey: poolKey(poolId) });
      void qc.invalidateQueries({ queryKey: poolsKey });
    },
  });
};

export const useLeavePool = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => leavePool(poolId),
    onSuccess: () => {
      qc.removeQueries({ queryKey: poolKey(poolId) });
      void qc.invalidateQueries({ queryKey: poolsKey });
    },
  });
};

export const useRemoveMember = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) => removeMember(poolId, uid),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: poolKey(poolId) });
    },
  });
};

export const useSetMemberRole = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, role }: { uid: string; role: MemberRole }) =>
      setMemberRole(poolId, uid, role).then(r => r.pool),
    onSuccess: pool => {
      qc.setQueryData(poolKey(poolId), pool);
    },
  });
};

export const useCreateInvite = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: InviteInput) => createInvite(poolId, input),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: poolInvitesKey(poolId) });
      void qc.invalidateQueries({ queryKey: poolKey(poolId) });
    },
  });
};

export const useRevokeInvite = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (inviteId: string) => revokeInvite(poolId, inviteId),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: poolInvitesKey(poolId) });
    },
  });
};
