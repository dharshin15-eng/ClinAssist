import { apiClient } from './apiClient';
import type { Role } from '../types';

export interface LoginRequestDto {
  email: string;
  password: string;
}

export interface AuthResponseDto {
  token: string;
  tokenType: string;
  id: string;
  email: string;
  fullName: string;
  role: Role;
}

export interface UserResponseDto {
  id: string;
  email: string;
  fullName: string;
  role: Role;
  createdAt?: string;
}

export const authService = {
  async login(credentials: LoginRequestDto): Promise<AuthResponseDto> {
    return await apiClient.post<AuthResponseDto>('/api/auth/login', credentials);
  },

  async getCurrentUser(): Promise<UserResponseDto> {
    return await apiClient.get<UserResponseDto>('/api/auth/me');
  }
};
