// ProgrammingLanguage import removed as we now only support Python

/**
 * Provide a user-friendly explanation for common Python error messages
 */
export function explainError(errorMessage: string): string {
  const lowerErrorMsg = errorMessage.toLowerCase();
  
  // Python errors
  if (lowerErrorMsg.includes('nameerror') || lowerErrorMsg.includes('name') && lowerErrorMsg.includes('is not defined')) {
    return "You're trying to use a variable that hasn't been created yet. Check if you spelled the variable name correctly and make sure you defined it before using it.";
  }
  
  if (lowerErrorMsg.includes('syntaxerror') || lowerErrorMsg.includes('invalid syntax')) {
    return "There's a syntax error in your code. This often happens when you're missing a colon, parenthesis, or have incorrect indentation. Check your code carefully.";
  }
  
  if (lowerErrorMsg.includes('indentationerror')) {
    return "Python uses indentation (spaces at the beginning of lines) to define code blocks. Make sure your indentation is consistent and that you're using the same number of spaces for each level.";
  }
  
  if (lowerErrorMsg.includes('typeerror')) {
    return "You're trying to perform an operation on a value of the wrong type. For example, trying to add a string and a number without converting them.";
  }
  
  if (lowerErrorMsg.includes('indexerror') || lowerErrorMsg.includes('index out of range')) {
    return "You're trying to access an element in a list or string using an index that doesn't exist. Remember that indexing starts at 0, and make sure you're not trying to access beyond the end of the list.";
  }
  
  if (lowerErrorMsg.includes('keyerror')) {
    return "You're trying to access a dictionary using a key that doesn't exist. Check the spelling of your key or use the .get() method to provide a default value.";
  }
  
  if (lowerErrorMsg.includes('attributeerror')) {
    return "You're trying to access an attribute or method that doesn't exist for this object. Check the spelling and make sure the object has this attribute.";
  }
  
  if (lowerErrorMsg.includes('valueerror')) {
    return "You're providing a value of the right type but inappropriate value to a function. For example, trying to convert a non-numeric string to an integer.";
  }
  
  if (lowerErrorMsg.includes('modulenotfounderror') || lowerErrorMsg.includes('no module named')) {
    return "Python can't find the module you're trying to import. Check the spelling and make sure the module is installed.";
  }
  
  if (lowerErrorMsg.includes('zerodivisionerror')) {
    return "You're trying to divide by zero, which is not allowed in mathematics. Check your division operations and make sure the denominator is never zero.";
  }
  
  // Generic fallback explanation
  return "There's an error in your code. Try reading the error message carefully and checking the line it mentions for issues.";
}