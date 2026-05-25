import { useEffect, useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { isSignInWithEmailLink, signInWithEmailLink } from 'firebase/auth';
import { getFirebaseAuth, isFirebaseConfigured } from '@/auth/firebase';
import { EMAIL_LS_KEY } from '@/auth/emailLink';
import { Loading } from '@/components/common/Loading';
import { SetupNeeded } from '@/components/Auth/SetupNeeded';

export const Route = createFileRoute('/auth/finish')({
  component: AuthFinish,
});

function AuthFinish() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [emailPrompt, setEmailPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (!isFirebaseConfigured()) return;
    const auth = getFirebaseAuth();
    const href = window.location.href;
    if (!isSignInWithEmailLink(auth, href)) {
      setError('This page expects an email sign-in link.');
      return;
    }
    let email = window.localStorage.getItem(EMAIL_LS_KEY);
    if (!email) {
      email = window.prompt('Confirm your email to finish signing in:');
      if (!email) {
        setEmailPrompt('Email required to finish sign-in.');
        return;
      }
    }
    signInWithEmailLink(auth, email, href)
      .then(() => {
        window.localStorage.removeItem(EMAIL_LS_KEY);
        void navigate({ to: '/' });
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Sign-in failed');
      });
  }, [navigate]);

  if (!isFirebaseConfigured()) return <SetupNeeded />;
  if (error || emailPrompt) {
    return (
      <main className="flex min-h-screen items-center justify-center px-6 text-center">
        <p className="text-red-200">{error ?? emailPrompt}</p>
      </main>
    );
  }
  return <Loading />;
}
