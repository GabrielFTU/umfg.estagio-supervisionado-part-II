export interface User {
  id: string;
  nome: string;
  email: string;
  ativo: boolean;
  perfilId: string;
  perfilNome: string;
  acessos: string[];
}

export interface LoginResponse {
  token: string;
  refreshToken: string;
  user: User;
}
