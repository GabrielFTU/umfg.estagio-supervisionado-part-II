import type { LoginResponse } from '@/types';
import { fetchWithAuth } from './api';

const API_BASE = '/api';

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

export async function changePassword(novaSenha: string, confirmarNovaSenha: string): Promise<void> {
  const res = await fetchWithAuth(`${API_BASE}/Usuarios/senha`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ novaSenha, confirmarNovaSenha }),
  });

  if (!res.ok) {
    let message = 'Não foi possível alterar a senha.';
    try {
      const body = await res.json() as { message?: string; errors?: Record<string, string[]> };
      if (body.errors) {
        message = Object.values(body.errors).flat()[0] ?? message;
      } else {
        message = body.message ?? message;
      }
    } catch {}
    throw new Error(message);
  }
}
