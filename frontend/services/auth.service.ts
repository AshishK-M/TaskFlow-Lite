import { api } from '@/lib/api';
import { API_ENDPOINTS } from '@/constants/api';
import type { AuthSession, LoginInput, SignupInput, User } from '@/types/auth';

export const authService = {
  async login(input: LoginInput): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>(API_ENDPOINTS.auth.login, input);
    return data;
  },
  async signup(input: SignupInput): Promise<AuthSession> {
    const { data } = await api.post<AuthSession>(API_ENDPOINTS.auth.signup, input);
    return data;
  },
  async me(): Promise<User> {
    const { data } = await api.get<User>(API_ENDPOINTS.auth.me);
    return data;
  },
};
