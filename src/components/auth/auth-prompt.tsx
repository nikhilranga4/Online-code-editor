import { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { AuthDialog } from './auth-dialog';
import { useAuth } from '@/contexts/auth-context';

export function AuthPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { isAuthenticated } = useAuth();
  
  // Show the prompt after a delay when the user has been active
  useEffect(() => {
    // Only show if not authenticated
    if (isAuthenticated) return;
    
    // Show the prompt after 2 minutes of activity
    const timer = setTimeout(() => {
      setShowPrompt(true);
    }, 2 * 60 * 1000);
    
    return () => clearTimeout(timer);
  }, [isAuthenticated]);
  
  const handleSignIn = () => {
    setShowPrompt(false);
    setShowAuthDialog(true);
  };
  
  return (
    <>
      <AlertDialog open={showPrompt} onOpenChange={setShowPrompt}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Save your progress?</AlertDialogTitle>
            <AlertDialogDescription>
              Sign up or log in to save your code and access it from anywhere. Your progress will be automatically saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Not now</AlertDialogCancel>
            <AlertDialogAction onClick={handleSignIn}>Sign in</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {showAuthDialog && (
        <AuthDialog 
          defaultOpen={true} 
          defaultTab="signup"
        />
      )}
    </>
  );
}
