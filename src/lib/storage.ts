import { ProgrammingLanguage } from '@/components/language-selector';
import { predefinedSnippets } from './predefined-snippets';

const STORAGE_PREFIX = 'codelab-';

/**
 * Save code snippet to local storage
 */
export function saveSnippet(language: ProgrammingLanguage, code: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${language}`, code);
  } catch (error) {
    console.error('Failed to save code:', error);
  }
}

/**
 * Load code snippet from local storage
 */
export function loadSnippet(language: ProgrammingLanguage): string | null {
  try {
    const savedCode = localStorage.getItem(`${STORAGE_PREFIX}${language}`);
    
    // If no saved code exists, return the default snippet
    if (!savedCode) {
      return predefinedSnippets[language] || null;
    }
    
    return savedCode;
  } catch (error) {
    console.error('Failed to load code:', error);
    return null;
  }
}

/**
 * Clear all saved snippets from local storage
 */
export function clearAllSnippets(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear snippets:', error);
  }
}