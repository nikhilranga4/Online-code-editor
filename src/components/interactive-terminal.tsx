import React, { useState, useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgrammingLanguage } from './language-selector';
import { 
  createTerminalSession, 
  sendTerminalInput, 
  resizeTerminal,
  closeTerminalSession,
  onTerminalOutput
} from '@/lib/docker-service';

interface InteractiveTerminalProps {
  language?: ProgrammingLanguage;
  className?: string;
  expanded?: boolean;
  onToggleExpand?: () => void;
}

export function InteractiveTerminal({ 
  language, 
  className,
  expanded = false,
  onToggleExpand
}: InteractiveTerminalProps) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [output, setOutput] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const terminalRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Initialize terminal session
  useEffect(() => {
    const initTerminal = async () => {
      try {
        setIsLoading(true);
        const id = await createTerminalSession(language);
        setSessionId(id);
        setIsConnected(true);
        setOutput(prev => [...prev, `Connected to ${language || 'terminal'} environment`]);
      } catch (error) {
        console.error('Failed to create terminal session:', error);
        setOutput(prev => [...prev, 'Failed to connect to terminal. Please try again.']);
      } finally {
        setIsLoading(false);
      }
    };

    initTerminal();

    return () => {
      if (sessionId) {
        closeTerminalSession(sessionId);
      }
    };
  }, [language]);

  // Listen for terminal output
  useEffect(() => {
    if (!sessionId) return;

    const cleanup = onTerminalOutput(sessionId, (terminalOutput) => {
      setOutput(prev => [...prev, terminalOutput]);
      
      // Auto-scroll to bottom
      setTimeout(() => {
        if (scrollAreaRef.current) {
          scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
        }
      }, 0);
    });

    return cleanup;
  }, [sessionId]);

  // Handle terminal resize
  useEffect(() => {
    if (!sessionId || !terminalRef.current) return;

    const resizeObserver = new ResizeObserver(entries => {
      const { width, height } = entries[0].contentRect;
      // Approximate columns and rows based on font size
      const cols = Math.floor(width / 8);
      const rows = Math.floor(height / 16);
      resizeTerminal(sessionId, cols, rows);
    });

    resizeObserver.observe(terminalRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, [sessionId]);

  // Handle input submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId || !input.trim()) return;

    // Add command to output
    setOutput(prev => [...prev, `$ ${input}`]);
    
    // Send command to terminal
    sendTerminalInput(sessionId, `${input}\n`);
    
    // Clear input
    setInput('');
    
    // Focus input field
    inputRef.current?.focus();
  };

  // Handle clear terminal
  const handleClear = () => {
    setOutput([]);
  };

  // Focus input when clicking on terminal
  const handleTerminalClick = () => {
    inputRef.current?.focus();
  };

  return (
    <div 
      className={cn(
        "h-full gradient-border bg-card/50 rounded-lg shadow-lg overflow-hidden flex flex-col",
        "transition-all duration-300 hover:shadow-xl",
        className
      )}
    >
      <div className="bg-card/50 backdrop-blur-sm p-3 border-b border-border flex justify-between items-center">
        <h2 className="text-sm font-semibold flex items-center">
          <span className={cn(
            "w-2 h-2 rounded-full mr-2",
            isConnected ? "bg-green-500" : "bg-red-500"
          )}></span>
          {language ? `${language.toUpperCase()} Terminal` : 'Interactive Terminal'}
        </h2>
        <div className="flex gap-2">
          <Button 
            variant="default" 
            size="sm"
            onClick={handleClear}
            className="transition-all duration-300 hover:scale-105 bg-slate-800 hover:bg-slate-900"
          >
            <Trash2 className="h-4 w-4 text-white" />
          </Button>
          {onToggleExpand && (
            <Button 
              variant="default" 
              size="sm"
              onClick={onToggleExpand}
              className="transition-all duration-300 hover:scale-105 bg-slate-800 hover:bg-slate-900"
            >
              {expanded ? <Minimize2 className="h-4 w-4 text-white" /> : <Maximize2 className="h-4 w-4 text-white" />}
            </Button>
          )}
        </div>
      </div>
      
      <div 
        ref={terminalRef} 
        className="flex-grow flex flex-col"
        onClick={handleTerminalClick}
      >
        <ScrollArea 
          ref={scrollAreaRef as React.RefObject<HTMLDivElement>} 
          className="flex-grow p-4 font-mono text-sm"
        >
          <div className="space-y-1">
            {output.map((line, index) => (
              <div 
                key={index} 
                className={cn(
                  "opacity-0 animate-[fadeIn_0.2s_ease-out_forwards]",
                  line.startsWith('$') ? "text-blue-400" : "text-foreground",
                  line.toLowerCase().includes('error') ? "text-red-400" : "",
                  line.toLowerCase().includes('warning') ? "text-yellow-400" : "",
                  line.toLowerCase().includes('success') ? "text-green-400" : ""
                )}
                style={{ animationDelay: `${Math.min(index * 10, 300)}ms` }}
              >
                {line}
              </div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-pulse">⟩</div>
                <div className="animate-spin h-3 w-3 border border-current rounded-full border-t-transparent"></div>
              </div>
            )}
          </div>
        </ScrollArea>
        
        <form onSubmit={handleSubmit} className="p-2 border-t border-border flex">
          <span className="text-blue-400 px-2 py-1">$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isConnected ? "Type your command here..." : "Connecting..."}
            disabled={!isConnected || isLoading}
            className={cn(
              "flex-grow bg-transparent border-none outline-none font-mono text-sm",
              "placeholder:text-muted-foreground/50"
            )}
            autoComplete="off"
            spellCheck="false"
          />
        </form>
      </div>
    </div>
  );
}
