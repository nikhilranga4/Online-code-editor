import { useState, useRef, useEffect } from 'react';
import { TerminalOutput } from '@/types/terminal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Trash2, Send } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  output: TerminalOutput[];
  onClear: () => void;
  onInputSubmit?: (input: string) => void;
}

export function Terminal({ output, onClear, onInputSubmit }: TerminalProps) {
  const [input, setInput] = useState('');
  const [activeInputRequest, setActiveInputRequest] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  // Find the last input request in the output
  useEffect(() => {
    const lastInputRequest = [...output].reverse().find(line => line.type === 'input-request');
    if (lastInputRequest) {
      setActiveInputRequest(lastInputRequest.content);
      // Focus the input field when an input request is detected
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    } else {
      setActiveInputRequest(null);
    }
    
    // Scroll to bottom when output changes
    if (scrollAreaRef.current) {
      const scrollArea = scrollAreaRef.current;
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [output]);
  
  const handleSubmitInput = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && onInputSubmit) {
      onInputSubmit(input);
      setInput('');
      setActiveInputRequest(null);
    }
  };
  return (
    <div className={cn(
      "h-full gradient-border bg-card/50 rounded-lg shadow-lg overflow-hidden flex flex-col",
      "transition-all duration-300 hover:shadow-xl"
    )}>
      <div className="bg-card/50 backdrop-blur-sm p-3 border-b border-border flex justify-between items-center">
        <h2 className="text-sm font-semibold flex items-center">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          Terminal Output
        </h2>
        <Button 
          variant="default" 
          size="sm"
          onClick={onClear}
          disabled={output.length === 0}
          className="transition-all duration-300 hover:scale-105 bg-slate-800 hover:bg-slate-900"
        >
          <Trash2 className="h-4 w-4 text-white" />
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-4 font-mono text-sm" ref={scrollAreaRef}>
        {output.length === 0 ? (
          <div className="text-muted-foreground italic flex items-center justify-center h-full">
            <span className="terminal-cursor">▊</span>
            Run your code to see the output here
          </div>
        ) : (
          <div className="space-y-2">
            {output.map((line, index) => (
              <div 
                key={index} 
                className={cn(
                  getTerminalLineClass(line.type),
                  "opacity-0 animate-[fadeIn_0.3s_ease-out_forwards]",
                  "transition-all duration-300",
                  { "animation-delay": `${index * 100}ms` }
                )}
              >
                {line.type === 'command' && <span className="text-blue-400">$ </span>}
                {line.type === 'input' && <span className="text-cyan-400">❯ </span>}
                {line.content}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      
      {/* Input field for user input during code execution */}
      {activeInputRequest && onInputSubmit && (
        <form 
          onSubmit={handleSubmitInput}
          className="p-3 border-t border-border flex items-center gap-2 bg-card/80"
        >
          <div className="text-xs text-primary font-medium truncate max-w-[150px]">
            {activeInputRequest}:
          </div>
          <div className="flex-1 flex items-center gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="flex-1 h-8 text-sm bg-background/50"
              placeholder="Type your input here..."
              autoComplete="off"
            />
            <Button 
              type="submit" 
              size="sm" 
              className="h-8"
              disabled={!input.trim()}
            >
              <Send className="h-3 w-3 mr-1" />
              Send
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}

function getTerminalLineClass(type: TerminalOutput['type']): string {
  switch (type) {
    case 'error':
      return 'text-red-400';
    case 'warning':
      return 'text-yellow-400';
    case 'success':
      return 'text-green-400';
    case 'info':
      return 'text-blue-400';
    case 'command':
      return 'text-purple-400';
    case 'input-request':
      return 'text-cyan-400 font-semibold';
    case 'input':
      return 'text-cyan-300';
    default:
      return 'text-foreground';
  }
}