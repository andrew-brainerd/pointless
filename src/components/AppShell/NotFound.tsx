import { Link } from '@tanstack/react-router';
import { Button } from '@/components/common/Button';

export const NotFound = () => (
  <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-6 text-center">
    <h1 className="text-4xl font-bold">404</h1>
    <p className="max-w-md text-accent-100">
      That page doesn't exist (or you don't have access to it).
    </p>
    <Link to="/">
      <Button>Go home</Button>
    </Link>
  </main>
);
