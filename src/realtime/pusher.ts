import Pusher from 'pusher-js';
import { apiFetch, ApiError } from '@/api/client';

let cached: Pusher | undefined;
let attempted = false;

const isConfigured = (): boolean => {
  const key = import.meta.env.VITE_PUSHER_KEY as string | undefined;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER as string | undefined;
  return Boolean(key && cluster);
};

// Lazy client init. Returns undefined when VITE_PUSHER_* env missing so the
// app still runs in dev without a Pusher account — realtime just silently
// stays disabled.
export const getPusherClient = (): Pusher | undefined => {
  if (cached) return cached;
  if (attempted) return undefined;
  attempted = true;
  if (!isConfigured()) return undefined;

  const key = import.meta.env.VITE_PUSHER_KEY as string;
  const cluster = import.meta.env.VITE_PUSHER_CLUSTER as string;

  cached = new Pusher(key, {
    cluster,
    authorizer: channel => ({
      authorize: (socketId, callback) => {
        void apiFetch<{ auth: string }>('/pusher/auth', {
          method: 'POST',
          body: { socket_id: socketId, channel_name: channel.name },
        })
          .then(data => callback(null, data))
          .catch((err: unknown) => {
            const e = err instanceof ApiError ? new Error(err.message) : (err as Error);
            callback(e, null);
          });
      },
    }),
  });
  return cached;
};

export const disconnectPusher = (): void => {
  cached?.disconnect();
  cached = undefined;
  attempted = false;
};
