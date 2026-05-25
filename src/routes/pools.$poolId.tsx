import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { PoolPage } from '@/components/Pool/PoolPage';

export const Route = createFileRoute('/pools/$poolId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { poolId } = Route.useParams();
  return (
    <ProtectedRoute>
      <PoolPage poolId={poolId} />
    </ProtectedRoute>
  );
}
