import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import * as SecureStore from 'expo-secure-store';
import api from '../api/client';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStorage = async () => {
      const storedToken = await SecureStore.getItemAsync('.auth_token');
      const storedUser = await SecureStore.getItemAsync('.auth_user');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
      setIsLoading(false);
    };
    loadStorage();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post<{ token: string; user: User }>('/auth/login', { username, password });
      const { token, user } = response.data;
      await SecureStore.setItemAsync('.auth_token', token);
      await SecureStore.setItemAsync('.auth_user', JSON.stringify(user));
      setToken(token);
      setUser(user);
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error);
      return { success: false, message: error.response?.data?.message || 'Ошибка входа' };
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('.auth_token');
    await SecureStore.deleteItemAsync('.auth_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};