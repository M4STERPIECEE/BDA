export type UserRole = 'ADMIN' | 'ETUDIANT';

export interface LoginRequest {
  username: string;
  password: string;
  role: UserRole;
}

export interface AuthResponse {
  token: string;
  username: string;
  role: UserRole;
}

