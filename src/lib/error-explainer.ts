import { ProgrammingLanguage } from "@/components/language-selector";

/**
 * Provides beginner-friendly explanations for common coding errors
 */
export function explainError(errorMessage: string, language: ProgrammingLanguage): string {
  const lowerErrorMsg = errorMessage.toLowerCase();
  
  // Common JavaScript errors
  if (language === 'javascript') {
    if (lowerErrorMsg.includes('is not defined')) {
      return "You're trying to use a variable that hasn't been created yet. Check if you spelled the variable name correctly and make sure you declared it before using it.";
    }
    
    if (lowerErrorMsg.includes('unexpected token')) {
      return "There's a syntax error in your code. This often happens when you're missing a parenthesis, bracket, or have an extra one. Check your code for matching pairs of (, ), {, }, [, ].";
    }
    
    if (lowerErrorMsg.includes('cannot read property') || lowerErrorMsg.includes('cannot read properties')) {
      return "You're trying to access a property of something that doesn't exist or is undefined. Make sure the object exists before trying to use its properties.";
    }
    
    if (lowerErrorMsg.includes('is not a function')) {
      return "You're trying to call something as a function, but it's not actually a function. Check the spelling and make sure you're using parentheses only on actual functions.";
    }
  }
  
  // Common Python errors (simulated)
  if (language === 'python') {
    if (lowerErrorMsg.includes('nameerror')) {
      return "You're trying to use a variable that doesn't exist. In Python, variable names are case-sensitive, so make sure you've spelled it correctly.";
    }
    
    if (lowerErrorMsg.includes('syntaxerror')) {
      return "There's a syntax error in your code. This could be due to missing colons after if/for/while statements, incorrect indentation, or unmatched parentheses.";
    }
    
    if (lowerErrorMsg.includes('indentationerror')) {
      return "Python uses indentation to define code blocks. Make sure your indentation is consistent (using either spaces or tabs, but not both).";
    }
  }
  
  // Common HTML errors
  if (language === 'html') {
    if (lowerErrorMsg.includes('tag')) {
      return "There might be an issue with your HTML tags. Make sure all tags are properly closed and nested correctly.";
    }
  }
  
  // Generic explanation if no specific error is recognized
  return "Don't worry about errors - they're how we learn! Try reading the error message carefully and look at the line number mentioned to find where the problem might be.";
}