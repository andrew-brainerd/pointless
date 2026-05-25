import { apiFetch } from './client';
import type { InviteDoc, PoolDoc } from '@/types/pool';

export const listMyInvites = () =>
  apiFetch<{ invites: InviteDoc[] }>('/invites/mine');

export const acceptInvite = (inviteId: string) =>
  apiFetch<{ invite: InviteDoc; pool: PoolDoc }>(
    `/invites/${encodeURIComponent(inviteId)}/accept`,
    { method: 'POST' },
  );

export const declineInvite = (inviteId: string) =>
  apiFetch<{ invite: InviteDoc }>(`/invites/${encodeURIComponent(inviteId)}/decline`, {
    method: 'POST',
  });
