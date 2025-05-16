import { User } from '@/types/user';

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
  // In a real app, this would make an API call to your backend
  // For demo purposes, we're simulating a successful login
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  // Create a mock user
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    provider: 'email'
  };
  
  // Save user to local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, `mock-token-${Date.now()}`);
  
  return user;
}

/**
 * Handles user registration with email/password
 */
export async function signupWithEmail(email: string, password: string, name?: string): Promise<User> {
  // In a real app, this would make an API call to your backend
  // For demo purposes, we're simulating a successful signup
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  if (!email || !password) {
    throw new Error('Email and password are required');
  }
  
  // Create a mock user
  const user: User = {
    id: `user-${Date.now()}`,
    email,
    name,
    provider: 'email'
  };
  
  // Save user to local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, `mock-token-${Date.now()}`);
  
  return user;
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
  
  // In a real app, you would exchange the code for a token with your backend
  // For demo purposes, we're simulating a successful authentication
  await new Promise(resolve => setTimeout(resolve, 800)); // Simulate API delay
  
  // Create a mock user based on the provider
  let user: User;
  
  if (provider === 'github') {
    user = {
      id: `github-${Date.now()}`,
      email: 'github-user@example.com',
      name: 'GitHub User',
      photoURL: 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
      provider: 'github'
    };
  } else {
    user = {
      id: `google-${Date.now()}`,
      email: 'google-user@example.com',
      name: 'Google User',
      photoURL: 'https://www.google.com/images/branding/googlelogo/1x/googlelogo_color_272x92dp.png',
      provider: 'google'
    };
  }
  
  // Save user to local storage
  localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  localStorage.setItem(TOKEN_STORAGE_KEY, `mock-token-${Date.now()}`);
  
  return user;
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
