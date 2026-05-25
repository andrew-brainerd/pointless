import { useNotifications } from '@/queries/notifications';
import { NotificationsDrawer } from './NotificationsDrawer';

interface NotificationsBellProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
}

export const NotificationsBell = ({ isOpen, onToggle, onClose }: NotificationsBellProps) => {
  const query = useNotifications();
  const count = query.data?.length ?? 0;

  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ''}`}
        className="relative flex items-center gap-2 rounded-full border border-accent-200/20 bg-canvas-bottom/40 px-3 py-1.5 text-sm text-accent-100 hover:bg-accent-900/40"
      >
        <span aria-hidden>🔔</span>
        {count > 0 && (
          <span className="rounded-full bg-accent-500 px-1.5 py-0.5 text-xs font-semibold leading-none">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>
      <NotificationsDrawer isOpen={isOpen} onClose={onClose} />
    </div>
  );
};
