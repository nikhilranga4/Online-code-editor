// ProgrammingLanguage import removed as we only support Python now
import { TerminalOutput } from '@/types/terminal';
import { explainError } from './error-explainer';

/**
 * Simulates running code in different languages
 */
export async function runCode(code: string): Promise<TerminalOutput[]> {
  // Simulate a brief delay to make it feel like processing
  await new Promise(resolve => setTimeout(resolve, 500));
  
  try {
    // Only Python is supported now
    return simulatePython(code);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const explanation = explainError(errorMessage);
    
    return [
      { type: 'error', content: errorMessage },
      { type: 'info', content: explanation }
    ];
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

// HTML and Java functions have been removed as we only support Python now
// This is in line with the user's preference for Python as the default language