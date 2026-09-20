import React, { createContext, useState, useEffect } from 'react';
import type { User, Role } from '../types';
import { authService } from '../services/authService';
import type { LoginRequestDto, AuthResponseDto } from '../services/authService';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginRequestDto) => Promise<AuthResponseDto>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'clinassist_token';
const USER_KEY = 'clinassist_user';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem(TOKEN_KEY);
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Optional background verification of stored token on mount
  useEffect(() => {
    const verifyStoredAuth = async () => {
      if (token && user) {
        try {
          // Attempt token verification with /api/auth/me
          const currentProfile = await authService.getCurrentUser();
          const updatedUser: User = {
            id: currentProfile.id,
            email: currentProfile.email,
            fullName: currentProfile.fullName,
            role: currentProfile.role as Role
          };
          setUser(updatedUser);
          localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
        } catch {
          // If token verification fails (e.g. expired or invalid), clear stored state
          logout();
        }
      }
    };

    verifyStoredAuth();
  }, []);

  const login = async (credentials: LoginRequestDto): Promise<AuthResponseDto> => {
    setIsLoading(true);
    try {
      const authResponse = await authService.login(credentials);

      const authenticatedUser: User = {
        id: authResponse.id,
        email: authResponse.email,
        fullName: authResponse.fullName,
        role: authResponse.role
      };

      setToken(authResponse.token);
      setUser(authenticatedUser);

      localStorage.setItem(TOKEN_KEY, authResponse.token);
      localStorage.setItem(USER_KEY, JSON.stringify(authenticatedUser));

      return authResponse;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated: !!token && !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
