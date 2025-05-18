/**
 * Code storage service for saving and loading code snippets
 * Uses MongoDB for authenticated users and localStorage for anonymous users
 */
import { ProgrammingLanguage } from '@/components/language-selector';
import { predefinedSnippets } from './predefined-snippets';
import { User } from '@/types/user';

// Backend API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Local storage prefix
const STORAGE_PREFIX = 'code-';

/**
 * Save code snippet
 * Uses MongoDB for authenticated users and localStorage for anonymous users
 * 
 * @param language - Programming language
 * @param code - Code snippet
 * @param user - User object (optional)
 */
export async function saveCodeSnippet(
  language: ProgrammingLanguage, 
  code: string, 
  user: User | null
): Promise<void> {
  try {
    if (user) {
      // Save to MongoDB if user is authenticated
      await saveToDatabase(user.id, language, code);
    } else {
      // Save to localStorage if user is not authenticated
      saveToLocalStorage(language, code);
    }
  } catch (error) {
    console.error('Failed to save code:', error);
    // Fallback to localStorage if database save fails
    saveToLocalStorage(language, code);
  }
}

/**
 * Load code snippet
 * Tries MongoDB for authenticated users and falls back to localStorage
 * 
 * @param language - Programming language
 * @param user - User object (optional)
 * @returns Code snippet or default template if not found
 */
export async function loadCodeSnippet(
  language: ProgrammingLanguage, 
  user: User | null
): Promise<string> {
  try {
    if (user) {
      // Try to load from MongoDB first
      const dbCode = await loadFromDatabase(user.id, language);
      if (dbCode) {
        return dbCode;
      }
    }
    
    // Fall back to localStorage if not found in database or user is not authenticated
    const localCode = loadFromLocalStorage(language);
    if (localCode) {
      return localCode;
    }
    
    // Return default template if no saved code exists
    return predefinedSnippets[language];
  } catch (error) {
    console.error('Failed to load code:', error);
    
    // Try localStorage as fallback
    const localCode = loadFromLocalStorage(language);
    if (localCode) {
      return localCode;
    }
    
    // Return default template if all else fails
    return predefinedSnippets[language];
  }
}

/**
 * Clear all saved snippets
 * Clears both MongoDB and localStorage
 * 
 * @param user - User object (optional)
 */
export async function clearAllSnippets(user: User | null): Promise<void> {
  try {
    // Clear localStorage
    clearLocalStorage();
    
    // Clear MongoDB if user is authenticated
    if (user) {
      await clearDatabaseSnippets(user.id);
    }
  } catch (error) {
    console.error('Failed to clear snippets:', error);
  }
}

/**
 * Save code snippet to MongoDB
 * 
 * @param userId - User ID
 * @param language - Programming language
 * @param code - Code snippet
 */
async function saveToDatabase(
  userId: string, 
  language: ProgrammingLanguage, 
  code: string
): Promise<void> {
  const response = await fetch(`${API_URL}/api/code`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      userId,
      language,
      code,
    }),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to save code to database');
  }
}

/**
 * Load code snippet from MongoDB
 * 
 * @param userId - User ID
 * @param language - Programming language
 * @returns Code snippet or null if not found
 */
async function loadFromDatabase(
  userId: string, 
  language: ProgrammingLanguage
): Promise<string | null> {
  try {
    const response = await fetch(`${API_URL}/api/code/${userId}/${language}`);
    
    if (response.status === 404) {
      return null; // Snippet not found
    }
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to load code from database');
    }
    
    const data = await response.json();
    return data.code;
  } catch (error) {
    console.error('Error loading from database:', error);
    return null;
  }
}

/**
 * Clear all snippets from MongoDB for a user
 * 
 * @param userId - User ID
 */
async function clearDatabaseSnippets(userId: string): Promise<void> {
  // This would be implemented in a real backend
  console.log(`Clearing database snippets for user ${userId}`);
  // For now, we'll just log this as the backend endpoint isn't implemented
}

/**
 * Save code snippet to localStorage
 * 
 * @param language - Programming language
 * @param code - Code snippet
 */
function saveToLocalStorage(language: ProgrammingLanguage, code: string): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${language}`, code);
  } catch (error) {
    console.error('Failed to save code to localStorage:', error);
  }
}

/**
 * Load code snippet from localStorage
 * 
 * @param language - Programming language
 * @returns Code snippet or null if not found
 */
function loadFromLocalStorage(language: ProgrammingLanguage): string | null {
  try {
    return localStorage.getItem(`${STORAGE_PREFIX}${language}`);
  } catch (error) {
    console.error('Failed to load code from localStorage:', error);
    return null;
  }
}

/**
 * Clear all snippets from localStorage
 */
function clearLocalStorage(): void {
  try {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error('Failed to clear snippets from localStorage:', error);
  }
}
