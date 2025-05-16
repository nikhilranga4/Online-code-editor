import { ProgrammingLanguage } from '@/components/language-selector';

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
  language: ProgrammingLanguage
): CodeSuggestion | null {
  // Get the current line up to the cursor
  const upToCursor = code.substring(0, cursorPosition);
  const currentLineStart = upToCursor.lastIndexOf('\n') + 1;
  const currentLine = upToCursor.substring(currentLineStart);
  
  // Get the word being typed (for more precise suggestions)
  const wordMatch = currentLine.match(/[\w.]+$/);
  const currentWord = wordMatch ? wordMatch[0] : '';

  // Return suggestions based on language and context
  switch (language) {
    case 'javascript':
      return getJavaScriptSuggestions(code, currentLine, currentWord);
    case 'python':
      return getPythonSuggestions(code, currentLine, currentWord);
    case 'java':
      return getJavaSuggestions(code, currentLine, currentWord);
    case 'html':
      return getHtmlSuggestions(code, currentLine, currentWord);
    default:
      return null;
  }
}

// JavaScript suggestions
function getJavaScriptSuggestions(
  _code: string,
  currentLine: string,
  currentWord: string
): CodeSuggestion | null {
  // Common JavaScript patterns
  if (currentLine.trim().startsWith('con') && !currentLine.includes('console')) {
    return {
      text: 'console.log();',
      displayText: 'console.log()',
      description: 'Log output to the console'
    };
  }
  
  if (currentLine.includes('function') && !currentLine.includes('{')) {
    return {
      text: ' {\n  \n}',
      displayText: ' { ... }',
      description: 'Function body'
    };
  }
  
  if (currentWord === 'for') {
    return {
      text: ' (let i = 0; i < array.length; i++) {\n  \n}',
      displayText: 'for loop',
      description: 'Standard for loop'
    };
  }
  
  if (currentWord === 'if') {
    return {
      text: ' (condition) {\n  \n}',
      displayText: 'if statement',
      description: 'Conditional statement'
    };
  }

  if (currentWord === '.map') {
    return {
      text: '((item) => {\n  return item;\n})',
      displayText: '.map((item) => { ... })',
      description: 'Array map function'
    };
  }

  return null;
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

// Java suggestions
function getJavaSuggestions(
  _code: string,
  currentLine: string,
  currentWord: string
): CodeSuggestion | null {
  if (currentWord === 'public') {
    return {
      text: ' static void main(String[] args) {\n    \n}',
      displayText: 'public static void main(String[] args)',
      description: 'Main method'
    };
  }
  
  if (currentWord === 'for') {
    return {
      text: ' (int i = 0; i < array.length; i++) {\n    \n}',
      displayText: 'for loop',
      description: 'Standard for loop'
    };
  }
  
  if (currentWord === 'if') {
    return {
      text: ' (condition) {\n    \n}',
      displayText: 'if statement',
      description: 'Conditional statement'
    };
  }
  
  if (currentLine.trim().startsWith('Sys') && !currentLine.includes('System.out')) {
    return {
      text: 'System.out.println();',
      displayText: 'System.out.println()',
      description: 'Print to console'
    };
  }

  if (currentWord === 'class') {
    return {
      text: ' ClassName {\n    \n}',
      displayText: 'class ClassName',
      description: 'Define a class'
    };
  }

  return null;
}

// HTML suggestions
function getHtmlSuggestions(
  _code: string,
  _currentLine: string,
  currentWord: string
): CodeSuggestion | null {
  if (currentWord === 'html') {
    return {
      text: '>\n  <head>\n    <title>Document</title>\n  </head>\n  <body>\n    \n  </body>\n</html>',
      displayText: '<html>...</html>',
      description: 'HTML document structure'
    };
  }
  
  if (currentWord === 'div') {
    return {
      text: ' class="">\n  \n</div>',
      displayText: '<div>...</div>',
      description: 'Div element'
    };
  }
  
  if (currentWord === 'table') {
    return {
      text: '>\n  <thead>\n    <tr>\n      <th></th>\n    </tr>\n  </thead>\n  <tbody>\n    <tr>\n      <td></td>\n    </tr>\n  </tbody>\n</table>',
      displayText: '<table>...</table>',
      description: 'Table structure'
    };
  }

  if (currentWord === 'style') {
    return {
      text: '>\n  body {\n    margin: 0;\n    padding: 0;\n    font-family: Arial, sans-serif;\n  }\n</style>',
      displayText: '<style>...</style>',
      description: 'Style element'
    };
  }

  return null;
}
