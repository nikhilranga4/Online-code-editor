import { io, Socket } from 'socket.io-client';
import { ProgrammingLanguage } from '@/components/language-selector';
import { TerminalOutput } from '@/types/terminal';

// Backend API URL from environment variables
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Log the API URL being used (for debugging)
console.log('Using API URL:', API_URL);

// Socket.io connection
let socket: Socket | null = null;

// Initialize socket connection
function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      reconnectionAttempts: 15,
      reconnectionDelay: 1000,
    });

    socket.on('connect', () => {
      console.log('Connected to backend server');
    });

    socket.on('connect_error', (error: Error) => {
      console.error('Connection error:', error);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('Disconnected from backend server:', reason);
    });
  }

  return socket;
}

/**
 * Execute code in Docker container
 * @param code - Code to execute
 * @param language - Programming language
 * @param input - Standard input for the program
 * @returns Promise with execution result
 */
export async function executeCode(
  code: string,
  language: ProgrammingLanguage,
  input: string = ''
): Promise<TerminalOutput[]> {
  try {
    // Get socket connection
    const socket = getSocket();
    
    // Make API request to execute code
    const response = await fetch(`${API_URL}/api/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code,
        language,
        input, // Pass user input to the backend
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to execute code');
    }

    const data = await response.json();
    const { executionId } = data;

    // Join execution room to receive results
    socket.emit('join_execution', executionId);

    // Wait for execution result
    return new Promise((resolve) => {
      socket.once('execution_result', (result: any) => {
        // Parse output into terminal lines
        const terminalOutput: TerminalOutput[] = [];

        // Add command line
        terminalOutput.push({
          type: 'command',
          content: `Running ${language} code...`,
        });

        if (result.status === 'success') {
          // Split output by lines and add to terminal
          const outputLines = result.output.split('\n');
          outputLines.forEach((line: string) => {
            if (line.trim()) {
              terminalOutput.push({
                type: 'standard',
                content: line,
              });
            }
          });

          // Add success message
          terminalOutput.push({
            type: 'success',
            content: `Program exited with code ${result.exitCode}`,
          });
        } else {
          // Add error message
          terminalOutput.push({
            type: 'error',
            content: result.output || 'Execution failed',
          });
        }

        resolve(terminalOutput);
      });

      // Handle timeout
      const terminalOutput: TerminalOutput[] = [];
      setTimeout(() => {
        if (terminalOutput.length === 0) {
          resolve([
            {
              type: 'error',
              content: 'Execution timed out',
            },
          ]);
        }
      }, 30000); // 30 seconds timeout
    });
  } catch (error) {
    console.error('Error executing code:', error);
    return [
      {
        type: 'error',
        content: error instanceof Error ? error.message : 'Unknown error occurred',
      },
    ];
  }
}

/**
 * Create a new terminal session
 * @param language - Programming language for the terminal environment
 * @returns Promise with session ID
 */
export function createTerminalSession(language?: ProgrammingLanguage): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      const socket = getSocket();

      socket.emit('terminal_create', { language });

      socket.once('terminal_created', (data: any) => {
        resolve(data.sessionId);
      });

      socket.once('terminal_error', (error: any) => {
        reject(new Error(error.message || 'Failed to create terminal session'));
      });

      // Handle timeout
      setTimeout(() => {
        reject(new Error('Terminal creation timed out'));
      }, 10000);
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * Send input to terminal session
 * @param sessionId - Terminal session ID
 * @param input - Input to send
 */
export function sendTerminalInput(sessionId: string, input: string): void {
  try {
    const socket = getSocket();
    socket.emit(`terminal_input_${sessionId}`, { input });
  } catch (error) {
    console.error('Error sending terminal input:', error);
  }
}

/**
 * Resize terminal session
 * @param sessionId - Terminal session ID
 * @param cols - Number of columns
 * @param rows - Number of rows
 */
export function resizeTerminal(sessionId: string, cols: number, rows: number): void {
  try {
    const socket = getSocket();
    socket.emit(`terminal_resize_${sessionId}`, { cols, rows });
  } catch (error) {
    console.error('Error resizing terminal:', error);
  }
}

/**
 * Close terminal session
 * @param sessionId - Terminal session ID
 */
export function closeTerminalSession(sessionId: string): void {
  try {
    const socket = getSocket();
    socket.emit(`terminal_close_${sessionId}`, {});
  } catch (error) {
    console.error('Error closing terminal session:', error);
  }
}

/**
 * Register terminal output listener
 * @param sessionId - Terminal session ID
 * @param callback - Callback function for terminal output
 * @returns Cleanup function
 */
export function onTerminalOutput(
  sessionId: string,
  callback: (output: string) => void
): () => void {
  const socket = getSocket();
  
  const handler = (data: { sessionId: string, output: string }) => {
    // Only process output for the specific session
    if (data.sessionId === sessionId) {
      callback(data.output);
    }
  };
  
  socket.on(`terminal_output`, handler);
  
  return () => {
    socket.off(`terminal_output`, handler);
  };
}
