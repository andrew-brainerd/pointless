import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { WagerPage } from '@/components/Wager/WagerPage';

export const Route = createFileRoute('/wagers/$wagerId')({
  component: RouteComponent,
});

function RouteComponent() {
  const { wagerId } = Route.useParams();
  return (
    <ProtectedRoute>
      <WagerPage wagerId={wagerId} />
    </ProtectedRoute>
  );
}
