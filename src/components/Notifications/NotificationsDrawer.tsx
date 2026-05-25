import { useEffect, useRef } from 'react';
import { Button } from '@/components/common/Button';
import { useMarkAllRead, useNotifications } from '@/queries/notifications';
import { NotificationItem } from './NotificationItem';

interface NotificationsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationsDrawer = ({ isOpen, onClose }: NotificationsDrawerProps) => {
  const query = useNotifications();
  const markAll = useMarkAllRead();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const notifications = query.data ?? [];

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-full z-20 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-accent-200/20 bg-canvas-bottom shadow-xl"
      role="dialog"
      aria-label="Notifications"
    >
      <header className="flex items-center justify-between gap-2 border-b border-accent-200/15 px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-accent-200/70">
          Notifications
        </p>
        {notifications.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            onClick={() => markAll.mutate()}
            disabled={markAll.isPending}
            className="px-2 py-1 text-xs"
          >
            {markAll.isPending ? 'Marking…' : 'Mark all read'}
          </Button>
        )}
      </header>
      {query.isLoading && (
        <p className="px-3 py-6 text-center text-sm text-accent-200/60">Loading…</p>
      )}
      {!query.isLoading && notifications.length === 0 && (
        <p className="px-3 py-6 text-center text-sm text-accent-200/60">
          You're all caught up.
        </p>
      )}
      {notifications.length > 0 && (
        <ul className="max-h-96 overflow-y-auto">
          {notifications.map(n => (
            <NotificationItem key={n._id} notification={n} onClose={onClose} />
          ))}
        </ul>
      )}
    </div>
  );
};
