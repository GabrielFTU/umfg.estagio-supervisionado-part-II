import type { LoginResponse } from '@/types';

const API_BASE = 'http://localhost:5019/api';

export async function login(email: string, senha: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/Auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    throw new Error('Email ou senha inválidos.');
  }

  return res.json();
}

export function saveSession(data: LoginResponse): void {
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function clearSession(): void {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}
