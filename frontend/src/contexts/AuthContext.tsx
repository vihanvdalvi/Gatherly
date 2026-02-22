import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User, Group } from '../types/index';
import { getStoredUser, setStoredUser, clearStoredUser } from '../utils/localStorage';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  selectedGroup: Group | null;
  setUser: (user: User | null) => void;
  setSelectedGroup: (group: Group | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  // Initialize user from localStorage on mount
  useEffect(() => {
    const storedUser = getStoredUser();
    if (storedUser) {
      setUserState(storedUser);
    }
  }, []);

  const setUser = (newUser: User | null) => {
    setUserState(newUser);
    if (newUser) {
      setStoredUser(newUser);
    } else {
      clearStoredUser();
    }
  };

  const logout = () => {
    setUser(null);
    setSelectedGroup(null);
    clearStoredUser();
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    selectedGroup,
    setUser,
    setSelectedGroup,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
