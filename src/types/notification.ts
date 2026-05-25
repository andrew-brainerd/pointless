// Mirrors pointless-api's NotificationDoc (see
// ../../pointless-api/src/data/notifications.ts). Duplicated per OQ-04.

export type NotificationType =
  | 'pool_invite'
  | 'wager_invite'
  | 'wager_resolution_proposed'
  | 'wager_settled'
  | 'wager_disputed'
  | 'wager_voided'
  | 'member_joined'
  | 'member_left';

export interface NotificationDoc {
  _id: string;
  userUid: string;
  type: NotificationType;
  title: string;
  body: string;
  link: string | null;
  payload: Record<string, unknown>;
  isRead: boolean;
  isDismissed: boolean;
  createdAt: string;
}
