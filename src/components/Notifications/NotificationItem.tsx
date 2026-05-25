import { Button } from '@/components/common/Button';
import { useDismissNotification, useMarkNotificationRead } from '@/queries/notifications';
import type { NotificationDoc } from '@/types/notification';

interface NotificationItemProps {
  notification: NotificationDoc;
  onClose?: () => void;
}

export const NotificationItem = ({ notification, onClose }: NotificationItemProps) => {
  const markRead = useMarkNotificationRead();
  const dismiss = useDismissNotification();

  const onClick = () => {
    if (!notification.isRead) {
      markRead.mutate(notification._id);
    }
    onClose?.();
  };

  const body = (
    <div className="flex flex-col gap-0.5 text-left">
      <p className="text-sm font-medium leading-snug">{notification.title}</p>
      <p className="text-xs leading-snug text-accent-200/80">{notification.body}</p>
    </div>
  );

  // Notification link paths come from the BE and are arbitrary strings.
  // TanStack Router's typed Link doesn't accept dynamic strings without a
  // type assertion, so use a plain anchor — it's an infrequent UX event,
  // a full reload on click is acceptable.
  return (
    <li className="flex items-start gap-3 border-b border-accent-200/10 px-3 py-3 last:border-b-0">
      {notification.link ? (
        <a
          href={notification.link}
          onClick={onClick}
          className="flex-1 hover:text-accent-100"
        >
          {body}
        </a>
      ) : (
        <button type="button" onClick={onClick} className="flex-1 hover:text-accent-100">
          {body}
        </button>
      )}
      <Button
        type="button"
        variant="ghost"
        onClick={() => dismiss.mutate(notification._id)}
        disabled={dismiss.isPending}
        className="px-2 py-1 text-xs"
        aria-label="Dismiss"
      >
        ×
      </Button>
    </li>
  );
};
