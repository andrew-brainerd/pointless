// Mirrors pointless-api's UserDoc (see ../../pointless-api/src/data/users.ts).
// Duplicated per spec OQ-04 (v1 prefers inline duplication over a shared package).
export interface UserDoc {
  _id: string;
  email: string;
  displayName: string;
  photoURL: string | null;
  createdAt: string;
  lastSeenAt: string;
}
