import { createRootRoute, Outlet } from '@tanstack/react-router';
import { NotFound } from '@/components/AppShell/NotFound';

export const Route = createRootRoute({
  component: RootLayout,
  notFoundComponent: NotFound,
});

function RootLayout() {
  return (
    <div className="min-h-full bg-gradient-to-br from-canvas-top to-canvas-bottom text-white">
      <Outlet />
    </div>
  );
}
