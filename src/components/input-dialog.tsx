import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface InputDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (input: string) => void;
  language: string;
}

export function InputDialog({ isOpen, onClose, onSubmit, language }: InputDialogProps) {
  const [input, setInput] = useState<string>('');
  const inputRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus the input field when dialog opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(input);
    setInput('');
  };
  
  // Get placeholder text based on language
  const getPlaceholder = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
        return 'Enter input for prompt() or process.stdin';
      case 'python':
        return 'Enter input for input() function';
      case 'java':
        return 'Enter input for Scanner or System.in';
      case 'cpp':
      case 'c':
        return 'Enter input for cin, scanf, or getline';
      case 'go':
        return 'Enter input for fmt.Scan or bufio.Scanner';
      case 'ruby':
        return 'Enter input for gets or STDIN.gets';
      case 'rust':
        return 'Enter input for std::io::stdin';
      case 'php':
        return 'Enter input for fgets(STDIN) or readline()';
      default:
        return 'Enter program input';
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Program Input</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="program-input">
                Input for your program
                <span className="text-xs text-muted-foreground ml-2">
                  (Use new lines for multiple inputs)
                </span>
              </Label>
              <Textarea
                id="program-input"
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={getPlaceholder()}
                className="min-h-[100px] font-mono"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">Submit Input</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
