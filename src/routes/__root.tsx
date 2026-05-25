import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootLayout,
});

function RootLayout() {
  return (
    <div className="min-h-full bg-gradient-to-br from-canvas-top to-canvas-bottom text-white">
      <Outlet />
    </div>
  );
}
