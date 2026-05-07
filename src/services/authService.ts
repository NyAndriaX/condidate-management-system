import { api, TOKEN_STORAGE_KEY } from './api';

type UserRole = 'admin' | 'user';

interface AuthUser {
  _id: string;
  email: string;
  name: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

interface AuthResponse {
  success: boolean;
  token: string;
  user: AuthUser;
}

interface RegisterPayload {
  email: string;
  password: string;
  name: string;
}

export const authService = {
  async login(email: string, password: string): Promise<{ token: string; user: AuthUser }> {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    this.setToken(response.data.token);

    return {
      token: response.data.token,
      user: response.data.user,
    };
  },

  async register(data: RegisterPayload): Promise<{ token: string; user: AuthUser }> {
    const response = await api.post<AuthResponse>('/auth/register', data);
    this.setToken(response.data.token);

    return {
      token: response.data.token,
      user: response.data.user,
    };
  },

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_STORAGE_KEY, token);
  },
};

export type { AuthUser, RegisterPayload };
