import { createFileRoute } from '@tanstack/react-router';
import { ProtectedRoute } from '@/auth/ProtectedRoute';
import { Home } from '@/components/Home/Home';

export const Route = createFileRoute('/')({
  component: () => (
    <ProtectedRoute>
      <Home />
    </ProtectedRoute>
  ),
});
