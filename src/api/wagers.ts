import { apiFetch } from './client';
import type { WagerDoc, WagerOption, WagerStatus } from '@/types/wager';

export interface CreateWagerInput {
  description: string;
  options: WagerOption[];
  myOptionId: string;
  myStake: number;
  invitedUids?: string[];
  closeBy?: string | null;
}

export const createWager = (poolId: string, input: CreateWagerInput) =>
  apiFetch<{ wager: WagerDoc }>(`/pools/${encodeURIComponent(poolId)}/wagers`, {
    method: 'POST',
    body: input,
  });

export const listPoolWagers = (poolId: string, status?: WagerStatus) => {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return apiFetch<{ wagers: WagerDoc[] }>(`/pools/${encodeURIComponent(poolId)}/wagers${query}`);
};

export const getWager = (wagerId: string) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}`);

export const stakeOnWager = (wagerId: string, optionId: string, stake: number) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}/stake`, {
    method: 'POST',
    body: { optionId, stake },
  });

export const declineWager = (wagerId: string) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}/decline`, {
    method: 'POST',
  });

export const cancelWager = (wagerId: string) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}/cancel`, {
    method: 'POST',
  });

export const proposeResolution = (wagerId: string, optionId: string) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}/propose-resolution`, {
    method: 'POST',
    body: { optionId },
  });

export const confirmResolution = (wagerId: string) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}/confirm-resolution`, {
    method: 'POST',
  });

export const disputeResolution = (wagerId: string) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}/dispute-resolution`, {
    method: 'POST',
  });

export const adminResolve = (wagerId: string, body: { optionId: string } | { void: true }) =>
  apiFetch<{ wager: WagerDoc }>(`/wagers/${encodeURIComponent(wagerId)}/admin-resolve`, {
    method: 'POST',
    body,
  });
