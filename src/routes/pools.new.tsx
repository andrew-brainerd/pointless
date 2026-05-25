import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { NewPool } from '@/components/Pool/NewPool';

export const Route = createFileRoute('/pools/new')({
  component: () => (
    <ProtectedRoute>
      <NewPool />
    </ProtectedRoute>
  ),
});
