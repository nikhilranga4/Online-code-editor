/**
 * User type definition for authentication
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  photoURL?: string;
  provider?: 'email' | 'github' | 'google';
}
