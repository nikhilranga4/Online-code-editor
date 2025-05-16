import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/auth-context';

export function AuthCallback() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { handleCallback } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    async function processCallback() {
      try {
        // Get the URL parameters
        const url = new URL(window.location.href);
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const error = url.searchParams.get('error');
        
        // Check if there's an error from the OAuth provider
        if (error) {
          setError(`Authentication error: ${error}`);
          setLoading(false);
          return;
        }
        
        // Check if we have the required parameters
        if (!code || !state) {
          setError('Invalid callback: missing code or state parameter');
          setLoading(false);
          return;
        }
        
        // Determine the provider from the URL path
        const path = url.pathname;
        let provider: 'github' | 'google';
        
        if (path.includes('/github')) {
          provider = 'github';
        } else if (path.includes('/google')) {
          provider = 'google';
        } else {
          setError('Unknown OAuth provider');
          setLoading(false);
          return;
        }
        
        // Process the callback
        await handleCallback(provider, code, state);
        
        // Redirect to the main page on success
        navigate('/');
      } catch (error) {
        setError(`Authentication failed: ${error instanceof Error ? error.message : String(error)}`);
        setLoading(false);
      }
    }
    
    processCallback();
  }, [handleCallback, navigate]);
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-lg">Completing authentication...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <div className="bg-destructive/10 text-destructive p-4 rounded-md max-w-md">
          <h2 className="text-lg font-semibold mb-2">Authentication Error</h2>
          <p>{error}</p>
        </div>
        <button 
          className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          onClick={() => navigate('/')}
        >
          Return to Editor
        </button>
      </div>
    );
  }
  
  return null;
}
