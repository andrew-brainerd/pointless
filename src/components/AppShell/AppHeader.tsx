import { useState } from 'react';
import { Link } from '@tanstack/react-router';
import { SignedInBadge } from '@/components/Auth/SignedInBadge';
import { NotificationsBell } from '@/components/Notifications/NotificationsBell';

export const AppHeader = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link to="/" className="text-2xl font-bold tracking-tight hover:text-accent-200">
        Pointless
      </Link>
      <div className="flex items-center gap-3">
        <NotificationsBell isOpen={drawerOpen} onToggle={() => setDrawerOpen(o => !o)} onClose={() => setDrawerOpen(false)} />
        <SignedInBadge />
      </div>
    </header>
  );
};
