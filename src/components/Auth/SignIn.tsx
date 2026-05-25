import { useState } from 'react';
import { GoogleAuthProvider, sendSignInLinkToEmail, signInWithPopup } from 'firebase/auth';
import { getFirebaseAuth } from '@/auth/firebase';
import { EMAIL_LS_KEY } from '@/auth/emailLink';

const actionCodeSettings = () => ({
  url: `${window.location.origin}/auth/finish`,
  handleCodeInApp: true,
});

export const SignIn = () => {
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState<'google' | 'email' | null>(null);

  const signInWithGoogle = async () => {
    setError(null);
    setPending('google');
    try {
      await signInWithPopup(getFirebaseAuth(), new GoogleAuthProvider());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Google sign-in failed');
    } finally {
      setPending(null);
    }
  };

  const sendMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    setPending('email');
    try {
      await sendSignInLinkToEmail(getFirebaseAuth(), email, actionCodeSettings());
      window.localStorage.setItem(EMAIL_LS_KEY, email);
      setLinkSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sending link failed');
    } finally {
      setPending(null);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 px-6">
      <header className="text-center">
        <h1 className="text-5xl font-bold tracking-tight">Pointless</h1>
        <p className="mt-3 text-accent-100">Sign in to wager with your people.</p>
      </header>

      <div className="flex w-full max-w-sm flex-col gap-4">
        <button
          type="button"
          onClick={signInWithGoogle}
          disabled={pending !== null}
          className="rounded-lg bg-white px-4 py-3 font-medium text-canvas-bottom hover:bg-accent-50 disabled:opacity-60"
        >
          {pending === 'google' ? 'Signing in…' : 'Continue with Google'}
        </button>

        <div className="flex items-center gap-3 text-sm text-accent-200/60">
          <span className="h-px flex-1 bg-accent-200/20" /> or <span className="h-px flex-1 bg-accent-200/20" />
        </div>

        {linkSent ? (
          <p className="rounded-lg bg-accent-900/40 p-4 text-sm text-accent-100">
            Check <span className="font-mono">{email}</span> for a sign-in link.
          </p>
        ) : (
          <form onSubmit={sendMagicLink} className="flex flex-col gap-3">
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="rounded-lg border border-accent-200/30 bg-canvas-bottom/40 px-4 py-3 placeholder:text-accent-200/40 focus:border-accent-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={pending !== null || !email}
              className="rounded-lg border border-accent-400 px-4 py-3 font-medium hover:bg-accent-900/40 disabled:opacity-60"
            >
              {pending === 'email' ? 'Sending…' : 'Email me a sign-in link'}
            </button>
          </form>
        )}

        {error && <p className="rounded-lg bg-red-900/40 p-3 text-sm text-red-200">{error}</p>}
      </div>
    </main>
  );
};
