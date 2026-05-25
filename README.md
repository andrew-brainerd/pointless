# pointless

Frontend for **Pointless** — a points-betting web app where small private groups place virtual-points wagers on real-world propositions. Not real money, no oracle.

> **Spec is the source of truth**: [`../docs/specs/pointless.md`](../docs/specs/pointless.md). Update the spec (bump version + Change Log) before changing behavior, and reference requirement IDs (`FR-NN`, `AC-NN`, `US-NN`) in commits/PRs.

## Status

`v0.7.0` — **Phases A through E complete; Phase F polish + READMEs done.** Live FE: Firebase Auth (Google + email link), pool/invite UX, full wager flow (create, stake, propose/confirm/dispute/admin-resolve), Pusher realtime subscriptions, notifications drawer in the header, 404 route, error boundary. 33 tests pass. **Pending v1**: the user's one-time host pick + first deploy (F-2).

## Stack

Node 24 · pnpm · TypeScript · Vite 6 · React 19 · Tailwind v4 (CSS-first config in `src/app.css`) · TanStack Router (file-based, auto-generated `src/routeTree.gen.ts`) · TanStack Query · Zustand · Firebase client SDK · pusher-js · Vitest + React Testing Library · ESLint 9 flat config · Prettier.

## Setup

```bash
pnpm install
cp .env.example .env.local        # then fill in values once Phase B lands
pnpm dev                          # Vite on http://localhost:5173
```

## Scripts

- `pnpm dev` — Vite dev server (port 5173)
- `pnpm build` — typecheck + production build to `dist/`
- `pnpm preview` — preview built bundle
- `pnpm lint` / `pnpm lint:fix`
- `pnpm format` / `pnpm format:check`
- `pnpm typecheck`
- `pnpm test` / `pnpm test:watch`
- `pnpm verify` — typecheck + lint + test (run before declaring a task done)

## Routing

File-based via `@tanstack/router-plugin`. New pages: drop a file in `src/routes/`; the Vite plugin regenerates `src/routeTree.gen.ts` on save. The generated file is gitignored.

## Environment

See [`.env.example`](.env.example). Only `VITE_`-prefixed vars are bundled to the client.

| Var | Notes |
|---|---|
| `VITE_API_BASE_URL` | Backend `/api/v1` base URL |
| `VITE_FIREBASE_API_KEY` / `VITE_FIREBASE_AUTH_DOMAIN` / `VITE_FIREBASE_PROJECT_ID` / `VITE_FIREBASE_APP_ID` | Web Firebase config; not secret per Firebase docs |
| `VITE_PUSHER_KEY` / `VITE_PUSHER_CLUSTER` | Realtime; if missing the app silently runs without realtime updates |

## Firebase setup

Auth uses [Firebase Authentication](https://firebase.google.com/docs/auth) — client SDK here, Admin SDK on the backend. The backend README owns the [main setup steps](../pointless-api/README.md#firebase-setup) (create project, enable Google + Email link providers, download service account JSON). Once that's done:

1. In the [Firebase console](https://console.firebase.google.com), open *Project settings → General → Your apps* and add a **Web app** if you haven't.
2. Copy the `firebaseConfig` snippet's values into `.env.local`:
   - `VITE_FIREBASE_API_KEY` ← `apiKey`
   - `VITE_FIREBASE_AUTH_DOMAIN` ← `authDomain`
   - `VITE_FIREBASE_PROJECT_ID` ← `projectId`
   - `VITE_FIREBASE_APP_ID` ← `appId`
3. These values are **not secret** — they identify the public-facing Firebase project. Source: [Firebase docs](https://firebase.google.com/docs/projects/api-keys).
4. Add your dev frontend origin (`http://localhost:5173`) to *Authentication → Settings → Authorized domains*.

If any `VITE_FIREBASE_*` var is missing, the app falls back to a "Setup needed" screen rather than crashing.

## Deploy

Static SPA — works on Vercel, Netlify, Cloudflare Pages, or Firebase Hosting (matches the Firebase Auth project nicely). Pick whichever:

- **Vercel / Netlify / Cloudflare Pages**: connect the repo, build command `pnpm build`, publish dir `dist`, set the `VITE_*` env vars in the hosting dashboard.
- **Firebase Hosting**: `firebase init hosting` → public dir `dist` → `pnpm build && firebase deploy --only hosting`. Match the Firebase project used for Auth.

After first deploy, add the production origin to *Firebase console → Authentication → Settings → Authorized domains*, and to the backend's `CORS_ALLOWLIST` env var.

## Sibling repos

- Backend: [`../pointless-api`](../pointless-api) — Express 5 + MongoDB + Firebase Admin.
- Reference: [`../brain-bucket`](../brain-bucket) — the Tauri sibling whose FE scaffold this mirrors (minus Tauri-specific bits).
