import type { LoginResponse } from '@/types';

// Dev (npm run dev):  NODE_ENV = 'development' → '/api' → proxiado pelo Rsbuild para localhost:5019.
//                     O browser faz requisição same-origin, zero CORS, sem precisar rebuildar o Docker.
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

  if (!res.ok) {
    // Tenta ler a mensagem de erro do backend para mostrar ao usuário
    let message = 'Email ou senha invalidos.';
    try {
      const body = await res.json() as { message?: string; detail?: string };
      message = body.message ?? body.detail ?? message;
    } catch { /* mantém a mensagem padrão */ }
    throw new Error(message);
  }

  return res.json() as Promise<LoginResponse>;
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
