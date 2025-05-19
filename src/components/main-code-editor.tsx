import { useState, useEffect } from 'react';
import { ProgrammingLanguage, LanguageSelector } from './language-selector';
import { CodeEditor } from './code-editor';
import { Terminal } from './terminal';
import { TerminalOutput } from '@/types/terminal';
import { runCode } from '@/lib/code-runner';
import { EditorHeader } from './editor-header';
import { useToast } from '@/hooks/use-toast';
import { loadSnippet, saveSnippet } from '@/lib/storage';
import { predefinedSnippets } from '@/lib/predefined-snippets';
import { cn } from '@/lib/utils';

export function MainCodeEditor() {
  const [language, setLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState<string>('');
  const [terminalOutput, setTerminalOutput] = useState<TerminalOutput[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [projectName, setProjectName] = useState('Untitled Project');
  const { toast } = useToast();

  useEffect(() => {
    const savedCode = loadSnippet(language);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(predefinedSnippets[language] || '');
    }
  }, [language]);

  const handleLanguageChange = (newLanguage: ProgrammingLanguage) => {
    saveSnippet(language, code);
    setLanguage(newLanguage);
    const savedCode = loadSnippet(newLanguage);
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(predefinedSnippets[newLanguage] || '');
    }
    setTerminalOutput([]);
  };

  const handleRun = async () => {
    if (!code.trim()) {
      toast({
        title: "Empty Code",
        description: "Please write some code before running!",
        variant: "destructive",
      });
      return;
    }

    setIsRunning(true);
    setTerminalOutput([{ type: 'info', content: 'Running code...' }]);
    
    try {
      saveSnippet(language, code);
      const result = await runCode(code);
      
      setTerminalOutput([
        { type: 'command', content: `Running ${language} code...` },
        ...result
      ]);
    } catch (error) {
      setTerminalOutput([
        { type: 'command', content: `Running ${language} code...` },
        { type: 'error', content: `Error: ${error instanceof Error ? error.message : String(error)}` }
      ]);
    } finally {
      setIsRunning(false);
    }
  };

  const handleClear = () => {
    setTerminalOutput([]);
  };

  const handleSave = () => {
    saveSnippet(language, code);
    toast({
      title: "Saved!",
      description: "Your code has been saved successfully.",
    });
  };

  const handleReset = () => {
    setCode(predefinedSnippets[language] || '');
    toast({
      title: "Reset Complete",
      description: "Code has been reset to the default example.",
    });
  };

  return (
    <div className="container mx-auto p-4 flex flex-col h-screen max-h-screen bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <EditorHeader 
        projectName={projectName} 
        onProjectNameChange={setProjectName}
        onSave={handleSave}
        onReset={handleReset}
      />
      
      <div className="flex flex-col md:flex-row h-full gap-4 pb-4">
        <div className="w-full md:w-3/5 flex flex-col fadeIn">
          <div className={cn(
            "gradient-border bg-card rounded-lg shadow-lg overflow-hidden flex flex-col h-full",
            "transition-all duration-300 hover:shadow-xl",
            "code-container"
          )}>
            <div className="bg-card/50 backdrop-blur-sm p-3 border-b border-border flex items-center justify-between">
              <LanguageSelector 
                value={language} 
                onChange={handleLanguageChange} 
              />
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className={cn(
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "px-4 py-2 rounded-md text-sm font-medium flex items-center",
                    "transition-all duration-300 transform hover:scale-105",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isRunning ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Running...
                    </>
                  ) : (
                    'Run'
                  )}
                </button>
              </div>
            </div>
            <div className="flex-grow overflow-hidden">
              <CodeEditor
                value={code}
                onChange={setCode}
                language={language}
              />
            </div>
          </div>
        </div>
        
        <div className="w-full md:w-2/5 flex flex-col slideIn">
          <Terminal 
            output={terminalOutput} 
            onClear={handleClear}
          />
        </div>
      </div>
    </div>
  );
}