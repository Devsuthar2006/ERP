'use client';
// ============================================
// Auth Context
// ============================================
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';
import { initialState } from './data';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  loginAs: (role: UserRole) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);
const AUTH_KEY = 'interior-ops-auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(AUTH_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch { /* ignore */ }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) {
      if (user) {
        localStorage.setItem(AUTH_KEY, JSON.stringify(user));
      } else {
        localStorage.removeItem(AUTH_KEY);
      }
    }
  }, [user, hydrated]);

  const login = (email: string, password: string): boolean => {
    const found = initialState.users.find(u => u.email === email && u.password === password);
    if (found) {
      setUser(found);
      return true;
    }
    return false;
  };

  const loginAs = (role: UserRole) => {
    const roleUsers: Record<UserRole, string> = {
      owner: 'owner@demo.com',
      subadmin: 'rahul@demo.com',
      thekedar: 'mahesh@demo.com',
    };
    const found = initialState.users.find(u => u.email === roleUsers[role]);
    if (found) setUser(found);
  };

  const logout = () => {
    setUser(null);
  };

  if (!hydrated) return null;

  return (
    <AuthContext.Provider value={{ user, login, loginAs, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
