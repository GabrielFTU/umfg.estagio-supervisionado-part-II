import { getToken, refreshAccessToken, clearSession } from './auth';

let refreshing = false;
let waitQueue: ((token: string | null) => void)[] = [];

function drainQueue(token: string | null) {
  waitQueue.forEach(cb => cb(token));
  waitQueue = [];
}

export async function fetchWithAuth(url: string, options: RequestInit = {}): Promise<Response> {
  const makeHeaders = (token: string | null) => {
    const h = new Headers(options.headers);
    if (token) h.set('Authorization', `Bearer ${token}`);
    return h;
  };

  const res = await fetch(url, { ...options, headers: makeHeaders(getToken()) });

  if (res.status !== 401) return res;

  if (refreshing) {
    return new Promise(resolve => {
      waitQueue.push(newToken => {
        resolve(fetch(url, { ...options, headers: makeHeaders(newToken) }));
      });
    });
  }

  refreshing = true;
  const newToken = await refreshAccessToken();
  refreshing = false;

  if (newToken) {
    drainQueue(newToken);
    return fetch(url, { ...options, headers: makeHeaders(newToken) });
  }

  drainQueue(null);
  clearSession();
  sessionStorage.setItem('sessionExpired', '1');
  window.location.replace('/');
  return res;
}
