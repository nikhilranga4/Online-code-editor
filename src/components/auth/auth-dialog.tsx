import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { LoginForm } from './login-form';
import { SignupForm } from './signup-form';
import { useAuth } from '@/contexts/auth-context';

interface AuthDialogProps {
  trigger?: React.ReactNode;
  defaultOpen?: boolean;
  defaultTab?: 'login' | 'signup';
  onOpenChange?: (open: boolean) => void;
}

export function AuthDialog({ trigger, defaultOpen = false, defaultTab = 'login', onOpenChange }: AuthDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { isAuthenticated, user, logout } = useAuth();
  
  // Force dialog to open when defaultOpen changes
  useEffect(() => {
    if (defaultOpen) {
      setOpen(true);
    }
  }, [defaultOpen]);
  
  // Handle open state changes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
  };

  if (isAuthenticated && user) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.name || user.email} 
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
              {user.name ? user.name[0].toUpperCase() : user.email[0].toUpperCase()}
            </div>
          )}
          <div className="text-sm">
            <p className="font-medium">{user.name || user.email}</p>
            <p className="text-xs text-muted-foreground">
              {user.provider ? `Signed in with ${user.provider}` : 'Signed in'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={logout}>
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Welcome</DialogTitle>
          <DialogDescription>
            Sign in or create an account to save your code and access it from anywhere.
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue={defaultTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="signup">Sign Up</TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onSuccess={() => setOpen(false)} />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm onSuccess={() => setOpen(false)} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
