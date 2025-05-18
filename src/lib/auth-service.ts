import { User } from '@/types/user';

// Backend API URL
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// OAuth configuration
const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID;
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const AUTH_CALLBACK_URL = import.meta.env.VITE_AUTH_CALLBACK_URL || 'http://localhost:5173/auth/callback';

// Local storage keys
const USER_STORAGE_KEY = 'online-compiler-user';
const TOKEN_STORAGE_KEY = 'online-compiler-token';

/**
 * Handles authentication with email/password
 */
export async function loginWithEmail(email: string, password: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Login failed');
    }

    const data = await response.json();
    
    // Save user and token to local storage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    
    return data.user;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
}

/**
 * Handles user registration with email/password
 */
export async function signupWithEmail(email: string, password: string, name?: string): Promise<User> {
  try {
    const response = await fetch(`${API_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Registration failed');
    }

    const data = await response.json();
    
    // Save user and token to local storage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    
    return data.user;
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
}

/**
 * Initiates GitHub OAuth flow
 */
export function loginWithGithub(): void {
  if (!GITHUB_CLIENT_ID) {
    throw new Error('GitHub client ID is not configured. Please check your .env file.');
  }
  
  // Build the GitHub OAuth URL
  const githubUrl = new URL('https://github.com/login/oauth/authorize');
  githubUrl.searchParams.append('client_id', GITHUB_CLIENT_ID);
  githubUrl.searchParams.append('redirect_uri', `${AUTH_CALLBACK_URL}/github`);
  githubUrl.searchParams.append('scope', 'user:email');
  githubUrl.searchParams.append('state', generateRandomState('github'));
  
  // Redirect to GitHub login
  window.location.href = githubUrl.toString();
}

/**
 * Initiates Google OAuth flow
 */
export function loginWithGoogle(): void {
  if (!GOOGLE_CLIENT_ID) {
    throw new Error('Google client ID is not configured. Please check your .env file.');
  }
  
  // Build the Google OAuth URL
  const googleUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleUrl.searchParams.append('client_id', GOOGLE_CLIENT_ID);
  googleUrl.searchParams.append('redirect_uri', `${AUTH_CALLBACK_URL}/google`);
  googleUrl.searchParams.append('response_type', 'code');
  googleUrl.searchParams.append('scope', 'email profile');
  googleUrl.searchParams.append('state', generateRandomState('google'));
  
  // Redirect to Google login
  window.location.href = googleUrl.toString();
}

/**
 * Handles OAuth callback from providers
 */
export async function handleAuthCallback(provider: 'github' | 'google', code: string, state: string): Promise<User> {
  // Verify state to prevent CSRF attacks
  const savedState = localStorage.getItem(`auth-state-${provider}`);
  if (!savedState || savedState !== state) {
    throw new Error('Invalid state parameter. Authentication failed.');
  }
  
  try {
    // Exchange code for token with backend
    const response = await fetch(`${API_URL}/api/auth/${provider}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ code }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || `${provider} authentication failed`);
    }

    const data = await response.json();
    
    // Save user and token to local storage
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
    localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
    
    return data.user;
  } catch (error) {
    console.error(`${provider} callback error:`, error);
    throw error;
  }
}

/**
 * Gets the current authenticated user
 */
export function getCurrentUser(): User | null {
  const userJson = localStorage.getItem(USER_STORAGE_KEY);
  if (!userJson) return null;
  
  try {
    return JSON.parse(userJson) as User;
  } catch (error) {
    console.error('Failed to parse user data:', error);
    return null;
  }
}

/**
 * Checks if user is authenticated
 */
export function isAuthenticated(): boolean {
  return !!localStorage.getItem(TOKEN_STORAGE_KEY);
}

/**
 * Logs out the current user
 */
export function logout(): void {
  localStorage.removeItem(USER_STORAGE_KEY);
  localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/**
 * Generates a random state parameter for OAuth security
 */
function generateRandomState(provider: string): string {
  const state = Math.random().toString(36).substring(2, 15);
  localStorage.setItem(`auth-state-${provider}`, state);
  return state;
}
