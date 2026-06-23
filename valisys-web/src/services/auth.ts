import type { LoginResponse } from '@/types';

// Dev (npm run dev):  NODE_ENV = 'development' → '/api' → proxiado pelo Rsbuild para localhost:5019.
// Prod (Docker build): NODE_ENV = 'production'  → usa VITE_API_URL injetado via build-arg.
const API_BASE: string =
  process.env.NODE_ENV === 'development'
    ? '/api'
    : process.env.VITE_API_URL || 'http://localhost:5019/api';

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  if (res.status === 429) {
    throw new Error('Muitas tentativas de login. Aguarde um momento antes de tentar novamente.');
  }

  if (!res.ok) {
    let message = 'Email ou senha inválidos.';
    try {
      const body = await res.json() as { message?: string; detail?: string };
      message = body.message ?? body.detail ?? message;
    } catch {}
    throw new Error(message);
  }

  return res.json() as Promise<LoginResponse>;
}

export async function refreshAccessToken(): Promise<string | null> {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (!storedRefreshToken) return null;

  try {
    const res = await fetch(`${API_BASE}/Auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: storedRefreshToken }),
    });

    if (!res.ok) {
      clearSession();
      return null;
    }

    const data = await res.json() as { token: string; refreshToken: string };
    localStorage.setItem('token', data.token);
    localStorage.setItem('refreshToken', data.refreshToken);
    return data.token;
  } catch {
    clearSession();
    return null;
  }
}

export async function logout(): Promise<void> {
  const storedRefreshToken = localStorage.getItem('refreshToken');
  if (storedRefreshToken) {
    try {
      await fetch(`${API_BASE}/Auth/logout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: storedRefreshToken }),
      });
    } catch {}
  }
  clearSession();
}

export function saveSession(data: LoginResponse): void {
  localStorage.setItem('token', data.token);
  localStorage.setItem('refreshToken', data.refreshToken);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('user');
}
