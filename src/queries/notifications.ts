import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  dismissNotification,
  listNotifications,
  markAllRead,
  markNotificationRead,
} from '@/api/notifications';

export const notificationsKey = ['notifications'] as const;

export const useNotifications = () =>
  useQuery({
    queryKey: notificationsKey,
    queryFn: () => listNotifications().then(r => r.notifications),
  });

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => markNotificationRead(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationsKey });
    },
  });
};

export const useDismissNotification = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dismissNotification(id),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationsKey });
    },
  });
};

export const useMarkAllRead = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => markAllRead(),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: notificationsKey });
    },
  });
};
