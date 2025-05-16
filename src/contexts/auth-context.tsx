import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types/user';
import {
  loginWithEmail,
  signupWithEmail,
  loginWithGithub as githubLogin,
  loginWithGoogle as googleLogin,
  logout as authLogout,
  getCurrentUser,
  isAuthenticated as checkAuth,
  handleAuthCallback
} from '@/lib/auth-service';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  loginWithGithub: () => void;
  loginWithGoogle: () => void;
  handleCallback: (provider: 'github' | 'google', code: string, state: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check for saved user on mount
  useEffect(() => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(checkAuth());
    }
  }, []);

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const user = await loginWithEmail(email, password);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  // Sign up with email, password, and optional name
  const signup = async (email: string, password: string, name?: string) => {
    try {
      const user = await signupWithEmail(email, password, name);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Signup failed:', error);
      throw error;
    }
  };

  // Login with GitHub OAuth
  const loginWithGithub = () => {
    try {
      githubLogin();
      // Note: This will redirect the user to GitHub, so no state updates here
    } catch (error) {
      console.error('GitHub login failed:', error);
      throw error;
    }
  };

  // Login with Google OAuth
  const loginWithGoogle = () => {
    try {
      googleLogin();
      // Note: This will redirect the user to Google, so no state updates here
    } catch (error) {
      console.error('Google login failed:', error);
      throw error;
    }
  };

  // Handle OAuth callback
  const handleCallback = async (provider: 'github' | 'google', code: string, state: string) => {
    try {
      const user = await handleAuthCallback(provider, code, state);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error(`${provider} callback failed:`, error);
      throw error;
    }
  };

  // Logout user
  const logout = () => {
    authLogout();
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      login, 
      signup, 
      loginWithGithub, 
      loginWithGoogle,
      handleCallback, 
      logout 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
