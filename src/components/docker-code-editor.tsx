import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Loader2, RefreshCw, KeyboardIcon, User, Minimize2 } from 'lucide-react';
import { MonacoCodeEditor } from './monaco-code-editor';
import { Terminal } from './terminal';
import { InteractiveTerminal } from './interactive-terminal';
import { HtmlPreview } from './html-preview';
import { InputDialog } from './input-dialog';
import { LanguageSelector, ProgrammingLanguage } from './language-selector';
import { executeCode } from '@/lib/docker-service';
import { TerminalOutput } from '@/types/terminal';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/auth-context';
import { predefinedSnippets } from '@/lib/predefined-snippets';
import { AuthDialog } from './auth/auth-dialog';

// Use predefined snippets from the imported file
// These are more detailed examples for each language
const codeTemplates = predefinedSnippets;

interface DockerCodeEditorProps {
  className?: string;
}

export function DockerCodeEditor({ className }: DockerCodeEditorProps) {
  const [language, setLanguage] = useState<ProgrammingLanguage>('python');
  const [code, setCode] = useState<string>(codeTemplates.python);
  const [output, setOutput] = useState<TerminalOutput[]>([]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('output');
  const [terminalExpanded, setTerminalExpanded] = useState<boolean>(false);
  const [showPreview, setShowPreview] = useState<boolean>(false);
  const [userInput, setUserInput] = useState<string>('');
  const [showInputDialog, setShowInputDialog] = useState<boolean>(false);
  const [needsInput, setNeedsInput] = useState<boolean>(false);
  const { isAuthenticated, user } = useAuth();

  // Update code when language changes - only on initial load
  useEffect(() => {
    // Only set the code if this is the first load for this language
    const savedCode = isAuthenticated && user 
      ? localStorage.getItem(`code-${language}-${user.id}`)
      : localStorage.getItem(`code-${language}`);
    
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(codeTemplates[language]);
    }
  }, [language]);

  // Handle language change
  const handleLanguageChange = (newLanguage: ProgrammingLanguage) => {
    // Check if the current code has been modified from the template or saved code
    const savedCode = isAuthenticated && user 
      ? localStorage.getItem(`code-${language}-${user.id}`)
      : localStorage.getItem(`code-${language}`);
    
    const currentTemplate = savedCode || codeTemplates[language];
    
    // Ask for confirmation if code has been modified from the saved/template version
    if (code !== currentTemplate) {
      const confirmed = window.confirm('Changing language will reset your code. Continue?');
      if (!confirmed) return;
    }
    
    // Set the new language
    setLanguage(newLanguage);
    
    // Show preview automatically when HTML is selected
    if (newLanguage === 'html') {
      setShowPreview(true);
    } else {
      setShowPreview(false);
    }
  };

  // Check if code might need input - with typo tolerance
  const checkForInputStatements = (code: string, language: ProgrammingLanguage): boolean => {
    // Always force input dialog for testing purposes
    // return true;
    
    // More comprehensive patterns for detecting input methods in various languages
    // Including common typos like 'intput' instead of 'input'
    const inputPatterns: Record<string, RegExp[]> = {
      javascript: [
        /pr[o|a]mpt\s*\(/, // prompt with typo tolerance
        /process\.stdin/, 
        /readline\(\)/, 
        /require\(['"]readline['"]\)/, 
        /createInterface\(/, 
        /question\s*\(/,
        /read\s*\(/
      ],
      python: [
        /in[tp]ut\s*\(/, // input with typo tolerance (intput, inptu)
        /raw_in[tp]ut\s*\(/, // raw_input with typo tolerance
        /sys\.stdin/, 
        /in[tp]ut\s*=/, // input assignment with typo tolerance
        /readline\(\)/,
        /read\s*\(/
      ],
      java: [
        /Scanner\s*\(/, 
        /System\.in/, 
        /BufferedReader/, 
        /readLine\(\)/, 
        /nextLine\(\)/, 
        /nextInt\(\)/, 
        /nextDouble\(\)/, 
        /next\s*\(\)/
      ],
      cpp: [
        /std::cin/, 
        /cin\s*>>/, 
        /getline\s*\(/, 
        /scanf/, 
        /std::getline/, 
        /fgets/, 
        /gets/
      ],
      c: [
        /scanf\s*\(/, 
        /getchar\s*\(/, 
        /fgets\s*\(/, 
        /gets\s*\(/, 
        /stdin/, 
        /getc\s*\(/, 
        /read\s*\(/
      ],
      go: [
        /fmt\.Scan/, 
        /bufio\.NewScanner/, 
        /reader\.ReadString/, 
        /Scanf/, 
        /Scanln/, 
        /ReadLine/, 
        /os\.Stdin/
      ],
      ruby: [
        /gets(?!\w)/, 
        /STDIN\.gets/, 
        /readline/, 
        /\$stdin/, 
        /chomp/
      ],
      rust: [
        /std::io::stdin/, 
        /io::stdin/, 
        /read_line/, 
        /stdin\(\)\.read/, 
        /BufRead/
      ],
      php: [
        /fgets\s*\(\s*STDIN\s*\)/, 
        /readline\s*\(/, 
        /\$_GET/, 
        /\$_POST/, 
        /stdin/, 
        /fread/, 
        /stream_get_line/
      ],
      html: [] // HTML doesn't typically have input statements
    };

    // Get patterns for the current language or use an empty array if not found
    const patterns = inputPatterns[language] || [];
    
    // Check if any pattern matches the code
    return patterns.some(pattern => pattern.test(code));
  };

  // Handle code execution
  const handleRunCode = async () => {
    try {
      setIsRunning(true);
      setActiveTab('output'); // Switch to output tab
      
      // Add command to output
      setOutput([
        { 
          type: 'command', 
          content: `Running ${language} code...` 
        }
      ]);
      
      // Check if code might need input
      const mightNeedInput = checkForInputStatements(code, language);
      
      if (mightNeedInput) {
        // Show the input dialog for user input
        setNeedsInput(true);
        setShowInputDialog(true);
        return; // Pause execution until input is provided
      }
      
      // Execute code in Docker container (with empty input if no input needed)
      const result = await executeCode(code, language, userInput);
      
      // Update output
      setOutput(result);
    } catch (error) {
      console.error('Error running code:', error);
      
      setOutput([
        { 
          type: 'error', 
          content: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      ]);
    } finally {
      setIsRunning(false);
      setNeedsInput(false);
      setUserInput(''); // Reset input after execution
    }
  };
  
  // Handle input submission
  const handleInputSubmit = async (input: string) => {
    setUserInput(input);
    setShowInputDialog(false);
    
    try {
      // Add the input to the output display so user can see what they entered
      setOutput(prev => [
        ...prev,
        { 
          type: 'input', 
          content: `User input: ${input}` 
        }
      ]);
      
      // Execute code with the provided input
      const result = await executeCode(code, language, input);
      
      // Update output
      setOutput(prev => [
        ...prev.filter(item => item.type !== 'input-request'), // Remove any input requests
        ...result
      ]);
    } catch (error) {
      console.error('Error running code with input:', error);
      
      setOutput(prev => [
        ...prev,
        { 
          type: 'error', 
          content: error instanceof Error ? error.message : 'An unknown error occurred'
        }
      ]);
    } finally {
      setIsRunning(false);
      setNeedsInput(false);
    }
  };

  // Clear terminal output
  const handleClearOutput = () => {
    setOutput([]);
  };

  // Save code to localStorage
  useEffect(() => {
    if (isAuthenticated && user) {
      localStorage.setItem(`code-${language}-${user.id}`, code);
    } else {
      localStorage.setItem(`code-${language}`, code);
    }
  }, [code, language, isAuthenticated, user]);

  // Load code from localStorage on initial component mount
  useEffect(() => {
    const savedCode = isAuthenticated && user 
      ? localStorage.getItem(`code-${language}-${user.id}`)
      : localStorage.getItem(`code-${language}`);
    
    if (savedCode) {
      setCode(savedCode);
    } else {
      setCode(codeTemplates[language]);
    }
    // Only run this on component mount, not on language change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, user]);

  return (
    <div className={cn("flex flex-col h-full min-h-[700px]", className)}>
      <div className="flex items-center justify-between mb-4 bg-card/50 p-3 rounded-lg shadow-sm border">
        <div className="flex items-center gap-4">
          <LanguageSelector 
            value={language} 
            onChange={handleLanguageChange} 
          />
          
          <Button
            onClick={handleRunCode}
            disabled={isRunning || !code.trim()}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            size="sm"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Code
              </>
            )}
          </Button>
          
          {/* Input button - shows if code might need input */}
          <Button
            onClick={() => setShowInputDialog(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title="Provide Input"
          >
            <KeyboardIcon className="h-3.5 w-3.5" />
            Input
          </Button>
          
          <Button
            onClick={handleClearOutput}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
            title="Clear Output"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Clear
          </Button>
          
          {/* Toggle HTML Preview button - only shown for HTML language */}
          {language === 'html' && (
            <Button
              onClick={() => setShowPreview(!showPreview)}
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
            >
              {showPreview ? 'Show Terminal' : 'Show Preview'}
            </Button>
          )}
        </div>
        
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Online Compiler
          </div>
          <AuthDialog 
            trigger={
              <Button variant="ghost" size="sm" className="flex items-center gap-2 text-black" title="Account">
                <User className="h-4 w-4" />
                Account
              </Button>
            } 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full min-h-[600px]">
        <Card className="h-full min-h-[600px] overflow-hidden shadow-md border-muted">
          <CardContent className="p-0 h-full">
            <MonacoCodeEditor 
              value={code} 
              onChange={setCode} 
              language={language} 
            />
          </CardContent>
        </Card>
        
        <div className={cn(
          "flex flex-col",
          terminalExpanded ? "fixed inset-0 z-50 p-4 bg-background/95 backdrop-blur-sm" : "h-full"
        )}>
          {/* Show HTML Preview for HTML/CSS code */}
          {language === 'html' && showPreview ? (
            <Card className="h-full shadow-md border-muted overflow-hidden">
              <CardContent className="p-0 h-full flex flex-col">
                <div className="flex items-center justify-between bg-muted/50 px-2 py-1 border-b">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium px-2">HTML Preview</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => setShowPreview(false)}
                    title="Show Terminal"
                  >
                    <Minimize2 className="h-4 w-4" />
                  </Button>
                </div>
                <HtmlPreview htmlContent={code} />
              </CardContent>
            </Card>
          ) : (
          <Card className="h-full shadow-md border-muted overflow-hidden">
            <CardContent className="p-0 h-full flex flex-col">
              <Tabs 
                value={activeTab} 
                onValueChange={setActiveTab}
                className="h-full flex flex-col"
              >
                <div className="flex items-center justify-between bg-muted/50 px-2 py-1 border-b">
                  <TabsList className="bg-transparent h-8">
                    <TabsTrigger value="output" className="text-xs h-7">Output</TabsTrigger>
                    <TabsTrigger value="terminal" className="text-xs h-7">Terminal</TabsTrigger>
                  </TabsList>
                </div>
                
                <TabsContent value="output" className="flex-grow p-0 m-0 data-[state=active]:flex flex-col">
                  <Terminal output={output} onClear={handleClearOutput} />
                </TabsContent>
                
                <TabsContent value="terminal" className="flex-grow p-0 m-0 data-[state=active]:flex flex-col">
                  <InteractiveTerminal 
                    language={language}
                    expanded={terminalExpanded}
                    onToggleExpand={() => setTerminalExpanded(!terminalExpanded)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
          )}
        </div>
      </div>
      
      {/* Input dialog */}
      <InputDialog
        isOpen={showInputDialog}
        onClose={() => {
          setShowInputDialog(false);
          // If we were waiting for input to run code, cancel the execution
          if (needsInput) {
            setIsRunning(false);
            setNeedsInput(false);
          }
        }}
        onSubmit={handleInputSubmit}
        language={language}
      />
    </div>
  );
}
