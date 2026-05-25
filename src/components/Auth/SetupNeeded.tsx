export const SetupNeeded = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">Setup needed</h1>
      <p className="max-w-lg text-accent-100">
        Pointless needs Firebase Auth config to sign you in. Set the{' '}
        <code className="rounded bg-accent-900 px-2 py-1 font-mono text-sm">VITE_FIREBASE_*</code>{' '}
        env vars in <code className="font-mono text-sm">.env.local</code>, then restart the dev
        server.
      </p>
      <p className="max-w-lg text-sm text-accent-200/70">
        See the <span className="font-mono">Firebase setup</span> section in the README for the
        full walkthrough.
      </p>
    </main>
  );
};
