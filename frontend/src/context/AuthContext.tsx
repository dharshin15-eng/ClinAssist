import React, { createContext, useState } from 'react';
import type { User, Role } from '../types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, role: Role) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const login = async (email: string, role: Role): Promise<void> => {
    setIsLoading(true);
    // Simulate minor network latency for UI loading state testing in Step 2
    await new Promise((resolve) => setTimeout(resolve, 800));

    const mockNameMap: Record<Role, string> = {
      DOCTOR: 'Dr. Alex Vance',
      HOSPITAL_STAFF: 'Sarah Jenkins (Nurse Specialist)',
      ADMIN: 'System Administrator'
    };

    const mockUser: User = {
      id: `usr-${Date.now()}`,
      email,
      fullName: mockNameMap[role] || 'ClinAssist User',
      role
    };

    setUser(mockUser);
    setIsLoading(false);
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoading,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};
