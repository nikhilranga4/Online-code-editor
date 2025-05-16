import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Save, 
  RefreshCw,
  Github,
  Moon,
  Sun,
  HelpCircle,
  UserPlus
} from 'lucide-react';
import { AuthDialog } from '@/components/auth/auth-dialog';
import { useTheme } from './theme-provider';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface EditorHeaderProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onSave: () => void;
  onReset: () => void;
}

export function EditorHeader({ 
  projectName, 
  onProjectNameChange, 
  onSave,
  onReset
}: EditorHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [tempName, setTempName] = useState(projectName);
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const { theme, setTheme } = useTheme();
  
  const handleSubmit = () => {
    onProjectNameChange(tempName);
    setIsEditing(false);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="flex items-center justify-between py-2 mb-4 px-2">
      <div className="flex items-center space-x-2">
        <Github className="h-6 w-6" />
        {isEditing ? (
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
            <Input
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              className="max-w-[200px] h-8"
              autoFocus
              onBlur={handleSubmit}
            />
          </form>
        ) : (
          <h1 
            className="text-lg font-semibold cursor-pointer hover:text-primary/80 transition-colors"
            onClick={() => { setIsEditing(true); }}
          >
            {projectName}
          </h1>
        )}
      </div>
      
      <div className="flex items-center space-x-2">
        {/* Account button with auth dialog */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm"
                className="h-9 px-3 hover:bg-primary hover:text-primary-foreground transition-colors flex items-center gap-1"
                onClick={() => setShowAuthDialog(true)}
              >
                <UserPlus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Account</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Sign in to save your progress</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        {/* Auth dialog */}
        <AuthDialog 
          defaultOpen={showAuthDialog}
          defaultTab="login"
          trigger={null}
          onOpenChange={(open: boolean) => {
            if (!open) {
              setShowAuthDialog(false);
            }
          }}
        />
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onSave}
                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <Save className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Save code</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={onReset}
                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Reset to example</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={toggleTheme}
                className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
              >
                {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Toggle theme</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="secondary" 
              size="sm"
              className="h-9 w-9 p-0 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Quick Guide</DialogTitle>
              <DialogDescription>
                Welcome to CodeLab! Here's how to get started.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4">
              <div>
                <h3 className="font-semibold">1. Choose a language</h3>
                <p className="text-sm text-muted-foreground">Select from JavaScript, Python, or HTML/CSS to start coding.</p>
              </div>
              <div>
                <h3 className="font-semibold">2. Write your code</h3>
                <p className="text-sm text-muted-foreground">The editor features syntax highlighting and auto-indentation.</p>
              </div>
              <div>
                <h3 className="font-semibold">3. Run your program</h3>
                <p className="text-sm text-muted-foreground">Click "Run" to see your program's output in the terminal.</p>
              </div>
              <div>
                <h3 className="font-semibold">4. Save your work</h3>
                <p className="text-sm text-muted-foreground">Your code is automatically saved in your browser, but you can explicitly save it with the save button.</p>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </header>
  );
}