// Mirrors pointless-api's WagerDoc (see ../../pointless-api/src/data/wagers.ts).
// Duplicated per spec OQ-04.

export type WagerStatus =
  | 'proposed'
  | 'active'
  | 'pending_confirmation'
  | 'disputed'
  | 'settled'
  | 'voided';

export type VoidReason =
  | 'cancelled'
  | 'all_one_option'
  | 'admin_void'
  | 'last_member_left'
  | 'pool_deleted';

export interface WagerOption {
  id: string;
  label: string;
}

export interface WagerParticipant {
  uid: string;
  optionId: string;
  stake: number;
  stakedAt: string;
}

export interface WagerResolution {
  proposedBy: string;
  proposedAt: string;
  optionId: string;
  confirmations: string[];
  disputes: string[];
}

export interface WagerDoc {
  _id: string;
  poolId: string;
  createdBy: string;
  createdAt: string;
  description: string;
  options: WagerOption[];
  closeBy: string | null;
  status: WagerStatus;
  participants: WagerParticipant[];
  invitedUids: string[];
  declinedUids: string[];
  resolution: WagerResolution | null;
  settledAt: string | null;
  settledOptionId: string | null;
  voidedAt: string | null;
  voidReason: VoidReason | null;
}
