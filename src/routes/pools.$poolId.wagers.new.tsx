import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { NewWagerForm } from '@/components/NewWager/NewWagerForm';

export const Route = createFileRoute('/pools/$poolId/wagers/new')({
  component: RouteComponent,
});

function RouteComponent() {
  const { poolId } = Route.useParams();
  return (
    <ProtectedRoute>
      <NewWagerForm poolId={poolId} />
    </ProtectedRoute>
  );
}
