import { apiFetch } from './client';
import type { UserDoc } from '@/types/user';

export interface SyncUserInput {
  displayName?: string;
  photoURL?: string | null;
}

export const syncUser = (input: SyncUserInput = {}) =>
  apiFetch<{ user: UserDoc }>('/users/sync', { method: 'POST', body: input });

export const getMe = () => apiFetch<{ user: UserDoc }>('/users/me');
