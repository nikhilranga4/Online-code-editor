import { useEffect, useRef, useState } from 'react';
import { ProgrammingLanguage } from './language-selector';
import { cn } from '@/lib/utils';
import { getSuggestions, CodeSuggestion } from '@/lib/code-suggestions';

interface CodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  language: ProgrammingLanguage;
}

export function CodeEditor({ value, onChange, language }: CodeEditorProps) {
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const [suggestion, setSuggestion] = useState<CodeSuggestion | null>(null);
  
  // Update suggestions when user types or moves cursor
  const updateSuggestions = (position: number) => {
    const newSuggestion = getSuggestions(value, position);
    setSuggestion(newSuggestion);
  };
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle Tab key for suggestions or indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      
      const start = e.currentTarget.selectionStart;
      const end = e.currentTarget.selectionEnd;
      
      // If there's a suggestion, use it
      if (suggestion) {
        const beforeCursor = value.substring(0, start);
        const afterCursor = value.substring(end);
        
        // Find the start of the current word
        const wordStartMatch = beforeCursor.match(/[\w.]*$/); 
        const wordStart = wordStartMatch ? start - wordStartMatch[0].length : start;
        
        // Apply the suggestion
        const newValue = value.substring(0, wordStart) + suggestion.text + afterCursor;
        onChange(newValue);
        
        // Calculate new cursor position after applying suggestion
        const newPosition = wordStart + suggestion.text.length;
        
        // Clear the suggestion
        setSuggestion(null);
        
        // Update cursor position
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = newPosition;
            editorRef.current.selectionEnd = newPosition;
            updateSuggestions(newPosition);
          }
        }, 0);
      } else {
        // Default tab behavior - insert two spaces
        const newValue = value.substring(0, start) + '  ' + value.substring(end);
        onChange(newValue);
        
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.selectionStart = start + 2;
            editorRef.current.selectionEnd = start + 2;
            updateSuggestions(start + 2);
          }
        }, 0);
      }
    } else if (e.key === 'Escape') {
      // Clear suggestion on Escape
      setSuggestion(null);
    }
  };

  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.style.height = 'auto';
      editorRef.current.style.height = `${editorRef.current.scrollHeight}px`;
    }
  }, [value]);

  // Handle cursor position changes
  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    updateSuggestions(target.selectionStart);
  };
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    updateSuggestions(e.target.selectionStart);
  };
  
  return (
    <div className="relative w-full h-full group">
      <textarea
        ref={editorRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onKeyUp={handleCursorChange}
        onClick={handleCursorChange}
        className={cn(
          "w-full h-full p-4 bg-card text-foreground font-mono text-sm resize-none outline-none",
          "transition-all duration-300",
          "focus:ring-2 focus:ring-primary/20",
          "placeholder:text-muted-foreground/50"
        )}
        spellCheck="false"
        placeholder="Start coding here..."
      />
      
      {/* Code suggestion tooltip */}
      {suggestion && (
        <div className={cn(
          "absolute bg-popover text-popover-foreground border border-border",
          "rounded-md shadow-md p-2 z-10 max-w-[300px] text-sm"
        )} style={{
          top: `${editorRef.current ? editorRef.current.getBoundingClientRect().top + 20 : 0}px`,
          left: `${editorRef.current ? editorRef.current.getBoundingClientRect().left + 20 : 0}px`,
        }}>
          <div className="font-medium">{suggestion.displayText}</div>
          {suggestion.description && (
            <div className="text-xs text-muted-foreground mt-1">{suggestion.description}</div>
          )}
          <div className="text-xs text-muted-foreground mt-2">Press <kbd className="px-1 py-0.5 bg-muted rounded border border-border">Tab</kbd> to accept</div>
        </div>
      )}
      
      <div className={cn(
        "absolute top-2 right-2 text-xs text-muted-foreground/50",
        "opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      )}>
        {language.toUpperCase()}
      </div>
    </div>
  );
}