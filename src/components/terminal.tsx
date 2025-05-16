import { TerminalOutput } from '@/types/terminal';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalProps {
  output: TerminalOutput[];
  onClear: () => void;
}

export function Terminal({ output, onClear }: TerminalProps) {
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
          variant="ghost" 
          size="sm"
          onClick={onClear}
          disabled={output.length === 0}
          className="transition-all duration-300 hover:scale-105"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      
      <ScrollArea className="flex-grow p-4 font-mono text-sm">
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
                {line.content}
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
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
    default:
      return 'text-foreground';
  }
}