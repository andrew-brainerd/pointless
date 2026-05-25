import { Link } from '@tanstack/react-router';
import { SignedInBadge } from '@/components/Auth/SignedInBadge';

export const AppHeader = () => (
  <header className="flex items-center justify-between px-6 py-4">
    <Link to="/" className="text-2xl font-bold tracking-tight hover:text-accent-200">
      Pointless
    </Link>
    <SignedInBadge />
  </header>
);
