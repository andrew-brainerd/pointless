import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  adminResolve,
  cancelWager,
  confirmResolution,
  createWager,
  declineWager,
  disputeResolution,
  getWager,
  listPoolWagers,
  proposeResolution,
  stakeOnWager,
  type CreateWagerInput,
} from '@/api/wagers';
import { poolKey } from './pools';
import type { WagerStatus } from '@/types/wager';

export const poolWagersKey = (poolId: string) => ['pool', poolId, 'wagers'] as const;
export const wagerKey = (wagerId: string) => ['wager', wagerId] as const;

export const usePoolWagers = (poolId: string | undefined, status?: WagerStatus) =>
  useQuery({
    queryKey: [...poolWagersKey(poolId ?? ''), status ?? 'all'],
    queryFn: () => listPoolWagers(poolId!, status).then(r => r.wagers),
    enabled: Boolean(poolId),
  });

export const useWager = (wagerId: string | undefined) =>
  useQuery({
    queryKey: wagerKey(wagerId ?? ''),
    queryFn: () => getWager(wagerId!).then(r => r.wager),
    enabled: Boolean(wagerId),
  });

const invalidateWagerAndPool = (
  qc: ReturnType<typeof useQueryClient>,
  poolId: string,
  wagerId: string,
) => {
  void qc.invalidateQueries({ queryKey: wagerKey(wagerId) });
  void qc.invalidateQueries({ queryKey: poolWagersKey(poolId) });
  void qc.invalidateQueries({ queryKey: poolKey(poolId) });
};

export const useCreateWager = (poolId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateWagerInput) => createWager(poolId, input).then(r => r.wager),
    onSuccess: wager => {
      invalidateWagerAndPool(qc, poolId, wager._id);
    },
  });
};

export const useStakeOnWager = (poolId: string, wagerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ optionId, stake }: { optionId: string; stake: number }) =>
      stakeOnWager(wagerId, optionId, stake).then(r => r.wager),
    onSuccess: () => invalidateWagerAndPool(qc, poolId, wagerId),
  });
};

export const useDeclineWager = (poolId: string, wagerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => declineWager(wagerId).then(r => r.wager),
    onSuccess: () => invalidateWagerAndPool(qc, poolId, wagerId),
  });
};

export const useCancelWager = (poolId: string, wagerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => cancelWager(wagerId).then(r => r.wager),
    onSuccess: () => invalidateWagerAndPool(qc, poolId, wagerId),
  });
};

export const useProposeResolution = (poolId: string, wagerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (optionId: string) => proposeResolution(wagerId, optionId).then(r => r.wager),
    onSuccess: () => invalidateWagerAndPool(qc, poolId, wagerId),
  });
};

export const useConfirmResolution = (poolId: string, wagerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => confirmResolution(wagerId).then(r => r.wager),
    onSuccess: () => invalidateWagerAndPool(qc, poolId, wagerId),
  });
};

export const useDisputeResolution = (poolId: string, wagerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => disputeResolution(wagerId).then(r => r.wager),
    onSuccess: () => invalidateWagerAndPool(qc, poolId, wagerId),
  });
};

export const useAdminResolve = (poolId: string, wagerId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { optionId: string } | { void: true }) =>
      adminResolve(wagerId, body).then(r => r.wager),
    onSuccess: () => invalidateWagerAndPool(qc, poolId, wagerId),
  });
};
