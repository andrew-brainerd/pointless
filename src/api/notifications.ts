import { apiFetch } from './client';
import type { NotificationDoc } from '@/types/notification';

export const listNotifications = (includeRead = false) =>
  apiFetch<{ notifications: NotificationDoc[] }>(
    `/notifications${includeRead ? '?includeRead=true' : ''}`,
  );

export const markNotificationRead = (id: string) =>
  apiFetch<{ notification: NotificationDoc }>(
    `/notifications/${encodeURIComponent(id)}/read`,
    { method: 'PATCH' },
  );

export const dismissNotification = (id: string) =>
  apiFetch<{ notification: NotificationDoc }>(
    `/notifications/${encodeURIComponent(id)}/dismiss`,
    { method: 'PATCH' },
  );

export const markAllRead = () =>
  apiFetch<{ count: number }>(`/notifications/read-all`, { method: 'PATCH' });
