// Mirrors pointless-api's PoolDoc / InviteDoc (see ../../pointless-api/src/data/{pools,invites}.ts).
// Duplicated per spec OQ-04 (v1 prefers inline duplication over a shared package).

export type MemberRole = 'admin' | 'member';

export interface PoolMember {
  role: MemberRole;
  balance: number;
  pending: number;
  joinedAt: string;
}

export interface PoolDoc {
  _id: string;
  name: string;
  createdBy: string;
  createdAt: string;
  startingPoints: number;
  members: Record<string, PoolMember>;
  memberUids: string[];
}

export type InviteStatus = 'pending' | 'accepted' | 'declined' | 'revoked';

export interface InviteDoc {
  _id: string;
  poolId: string;
  invitedUid: string | null;
  invitedEmail: string;
  invitedBy: string;
  createdAt: string;
  status: InviteStatus;
  resolvedAt: string | null;
}
