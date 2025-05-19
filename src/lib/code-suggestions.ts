// Interface for code suggestion
export interface CodeSuggestion {
  text: string;
  displayText: string;
  description?: string;
}

// Get suggestions based on current code, cursor position, and language
export function getSuggestions(
  code: string,
  cursorPosition: number,
): CodeSuggestion | null {
  // Get the current line up to the cursor
  const upToCursor = code.substring(0, cursorPosition);
  const currentLineStart = upToCursor.lastIndexOf('\n') + 1;
  const currentLine = upToCursor.substring(currentLineStart);
  
  // Get the word being typed (for more precise suggestions)
  const wordMatch = currentLine.match(/[\w.]+$/);
  const currentWord = wordMatch ? wordMatch[0] : '';

  // Only Python is supported now
  return getPythonSuggestions(code, currentLine, currentWord);
}

// Python suggestions
function getPythonSuggestions(
  _code: string,
  currentLine: string,
  currentWord: string
): CodeSuggestion | null {
  if (currentWord === 'def') {
    return {
      text: ' function_name(parameters):\n    ',
      displayText: 'def function_name(parameters):',
      description: 'Define a function'
    };
  }
  
  if (currentWord === 'for') {
    return {
      text: ' item in items:\n    ',
      displayText: 'for item in items:',
      description: 'For loop'
    };
  }
  
  if (currentWord === 'if') {
    return {
      text: ' condition:\n    ',
      displayText: 'if condition:',
      description: 'If statement'
    };
  }
  
  if (currentLine.trim().startsWith('pr') && !currentLine.includes('print')) {
    return {
      text: 'print()',
      displayText: 'print()',
      description: 'Print to console'
    };
  }

  if (currentWord === 'class') {
    return {
      text: ' ClassName:\n    def __init__(self):\n        ',
      displayText: 'class ClassName:',
      description: 'Define a class'
    };
  }

  return null;
}

// Java and HTML suggestion functions removed as we only support Python now
// This aligns with the user's preference for Python as the default language
