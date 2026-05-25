import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { InvitePage } from '@/components/Invites/InvitePage';

export const Route = createFileRoute('/invites/$inviteId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { inviteId } = Route.useParams();
  return (
    <ProtectedRoute>
      <InvitePage inviteId={inviteId} />
    </ProtectedRoute>
  );
}
