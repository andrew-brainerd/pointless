import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string | undefined,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string | undefined,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string | undefined,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string | undefined,
};

export const isFirebaseConfigured = (): boolean =>
  Boolean(config.apiKey && config.authDomain && config.projectId && config.appId);

let app: FirebaseApp | undefined;
let auth: Auth | undefined;

export const getFirebaseAuth = (): Auth => {
  if (auth) return auth;
  if (!isFirebaseConfigured()) {
    throw new Error('Firebase is not configured. See README "Firebase setup".');
  }
  app = initializeApp({
    apiKey: config.apiKey!,
    authDomain: config.authDomain!,
    projectId: config.projectId!,
    appId: config.appId!,
  });
  auth = getAuth(app);
  return auth;
};
