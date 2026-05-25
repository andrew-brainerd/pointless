import { apiFetch } from './client';
import type { InviteDoc, MemberRole, PoolDoc } from '@/types/pool';

export interface CreatePoolInput {
  name: string;
  startingPoints?: number;
}

export const createPool = (input: CreatePoolInput) =>
  apiFetch<{ pool: PoolDoc }>('/pools', { method: 'POST', body: input });

export const listPools = () => apiFetch<{ pools: PoolDoc[] }>('/pools');

export const getPool = (poolId: string) =>
  apiFetch<{ pool: PoolDoc }>(`/pools/${encodeURIComponent(poolId)}`);

export interface UpdatePoolInput {
  name?: string;
  startingPoints?: number;
}

export const updatePool = (poolId: string, patch: UpdatePoolInput) =>
  apiFetch<{ pool: PoolDoc }>(`/pools/${encodeURIComponent(poolId)}`, {
    method: 'PATCH',
    body: patch,
  });

export const deletePool = (poolId: string) =>
  apiFetch<void>(`/pools/${encodeURIComponent(poolId)}`, { method: 'DELETE' });

export const leavePool = (poolId: string) =>
  apiFetch<void>(`/pools/${encodeURIComponent(poolId)}/leave`, { method: 'POST' });

export const removeMember = (poolId: string, uid: string) =>
  apiFetch<void>(`/pools/${encodeURIComponent(poolId)}/members/${encodeURIComponent(uid)}`, {
    method: 'DELETE',
  });

export const setMemberRole = (poolId: string, uid: string, role: MemberRole) =>
  apiFetch<{ pool: PoolDoc }>(
    `/pools/${encodeURIComponent(poolId)}/members/${encodeURIComponent(uid)}/role`,
    { method: 'PATCH', body: { role } },
  );

export interface InviteInput {
  invitedUid?: string;
  invitedEmail?: string;
}

export interface InviteResponse {
  invite: InviteDoc;
  status: 'created' | 'already_invited' | 'already_member';
}

export const createInvite = (poolId: string, input: InviteInput) =>
  apiFetch<InviteResponse>(`/pools/${encodeURIComponent(poolId)}/invites`, {
    method: 'POST',
    body: input,
  });

export const listPoolInvites = (poolId: string) =>
  apiFetch<{ invites: InviteDoc[] }>(`/pools/${encodeURIComponent(poolId)}/invites`);

export const revokeInvite = (poolId: string, inviteId: string) =>
  apiFetch<{ invite: InviteDoc }>(
    `/pools/${encodeURIComponent(poolId)}/invites/${encodeURIComponent(inviteId)}`,
    { method: 'DELETE' },
  );
