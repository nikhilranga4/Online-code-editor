import { ProgrammingLanguage } from '@/components/language-selector';
import { TerminalOutput } from '@/types/terminal';
import { explainError } from './error-explainer';

/**
 * Simulates running code in different languages
 */
export async function runCode(code: string, language: ProgrammingLanguage): Promise<TerminalOutput[]> {
  // Simulate a brief delay to make it feel like processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    switch (language) {
      case 'javascript':
        return runJavaScript(code);
      case 'python':
        return simulatePython(code);
      case 'html':
        return runHtml(code);
      case 'java':
        return simulateJava(code);
      default:
        return [{ type: 'error', content: `Language "${language}" is not supported yet` }];
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const explanation = explainError(errorMessage, language);
    
    return [
      { type: 'error', content: errorMessage },
      { type: 'info', content: explanation }
    ];
  }
}

/**
 * Actually runs JavaScript code using Function constructor
 */
function runJavaScript(code: string): TerminalOutput[] {
  const output: TerminalOutput[] = [];
  const originalConsole = { ...console };
  
  // Capture console.log output
  const mockConsoleLog = (...args: any[]) => {
    const content = args.map(arg => {
      if (typeof arg === 'object') {
        try {
          return JSON.stringify(arg);
        } catch {
          return String(arg);
        }
      }
      return String(arg);
    }).join(' ');
    
    output.push({ type: 'standard', content });
  };
  
  // Capture console.error output
  const mockConsoleError = (...args: any[]) => {
    const content = args.map(arg => String(arg)).join(' ');
    output.push({ type: 'error', content });
  };
  
  // Capture console.warn output
  const mockConsoleWarn = (...args: any[]) => {
    const content = args.map(arg => String(arg)).join(' ');
    output.push({ type: 'warning', content });
  };
  
  // Capture console.info output
  const mockConsoleInfo = (...args: any[]) => {
    const content = args.map(arg => String(arg)).join(' ');
    output.push({ type: 'info', content });
  };
  
  try {
    // Override console methods to capture output
    console.log = mockConsoleLog;
    console.error = mockConsoleError;
    console.warn = mockConsoleWarn;
    console.info = mockConsoleInfo;
    
    // Run the code
    const wrappedCode = `
      try {
        ${code}
      } catch (error) {
        console.error(error.message);
      }
    `;
    
    // Using Function constructor to create a function from string
    const runFunction = new Function(wrappedCode);
    runFunction();
    
    if (output.length === 0) {
      output.push({ type: 'success', content: 'Code executed successfully with no output.' });
    }
    
    return output;
  } catch (error) {
    return [{ 
      type: 'error', 
      content: error instanceof Error ? error.message : String(error) 
    }];
  } finally {
    // Restore original console methods
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  }
}

/**
 * Simulates Python execution by looking for print statements and basic syntax
 */
function simulatePython(code: string): TerminalOutput[] {
  const output: TerminalOutput[] = [];
  
  // Simple pattern matching for print statements
  const printRegex = /print\s*\(\s*["'](.*)["']\s*\)/g;
  let match;
  
  while ((match = printRegex.exec(code)) !== null) {
    output.push({ type: 'standard', content: match[1] });
  }
  
  // Check for common Python syntax errors
  if (code.includes('console.log')) {
    output.push({ 
      type: 'error', 
      content: 'SyntaxError: console.log is not a valid Python function. Use print() instead.' 
    });
  }
  
  if (output.length === 0) {
    // Try to detect if there's code but no print statements
    if (code.trim().length > 0) {
      output.push({ 
        type: 'info', 
        content: 'No output detected. Make sure you\'re using print() to display results.' 
      });
    } else {
      output.push({ type: 'standard', content: 'No code to execute.' });
    }
  }
  
  return output;
}

/**
 * Renders HTML in a virtual environment and returns the result
 */
function runHtml(code: string): TerminalOutput[] {
  const output: TerminalOutput[] = [];
  
  // Check if it looks like HTML
  if (!code.includes('<') || !code.includes('>')) {
    output.push({ 
      type: 'warning', 
      content: 'This doesn\'t look like valid HTML. Make sure to include tags like <html>, <body>, etc.' 
    });
  } else {
    output.push({ 
      type: 'success', 
      content: 'HTML rendered successfully. In a real environment, you would see a visual preview here.' 
    });
    
    // Check for common elements
    if (!code.toLowerCase().includes('<html')) {
      output.push({ 
        type: 'info', 
        content: 'Tip: It\'s good practice to include the <html> tag in your document.' 
      });
    }
    
    if (!code.toLowerCase().includes('<body')) {
      output.push({ 
        type: 'info', 
        content: 'Tip: Consider adding a <body> tag to organize your content.' 
      });
    }
  }
  
  return output;
}

/**
 * Simulates Java execution by looking for System.out.println statements and basic syntax
 */
function simulateJava(code: string): TerminalOutput[] {
  const output: TerminalOutput[] = [];
  
  // Simple pattern matching for System.out.println statements
  const printRegex = /System\.out\.println\s*\(\s*"(.*)"\s*\)/g;
  let match;
  
  while ((match = printRegex.exec(code)) !== null) {
    output.push({ type: 'standard', content: match[1] });
  }
  
  // Check for common Java syntax elements
  if (!code.includes('class')) {
    output.push({ 
      type: 'warning', 
      content: 'Your code doesn\'t include a class definition, which is required in Java.' 
    });
  }
  
  if (!code.includes('public static void main')) {
    output.push({ 
      type: 'warning', 
      content: 'No main method found. Java programs typically need a main method as an entry point.' 
    });
  }
  
  // Check for common Java syntax errors
  if (code.includes('console.log')) {
    output.push({ 
      type: 'error', 
      content: 'Error: console.log is not a valid Java method. Use System.out.println() instead.' 
    });
  }
  
  if (code.includes('print(')) {
    output.push({ 
      type: 'error', 
      content: 'Error: print() is not a standard Java method. Use System.out.println() instead.' 
    });
  }
  
  if (output.length === 0) {
    // Try to detect if there's code but no print statements
    if (code.trim().length > 0) {
      output.push({ 
        type: 'info', 
        content: 'No output detected. Make sure you\'re using System.out.println() to display results.' 
      });
    } else {
      output.push({ type: 'standard', content: 'No code to execute.' });
    }
  }
  
  return output;
}