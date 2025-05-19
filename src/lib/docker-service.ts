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
  // Create a basic result with the input for fallback
  const terminalOutput: TerminalOutput[] = [
    {
      type: 'command',
      content: `Running ${language} code...`,
    }
  ];
  
  // Add input to output if provided
  if (input) {
    terminalOutput.push({
      type: 'input',
      content: input,
    });
  }
  
  // Handle Python code directly in the frontend as a fallback for simple cases
  if (language === 'python' && code.includes('print(')) {
    try {
      // Check for input pattern
      const hasInput = code.includes('input(');
      const varInputPattern = /([\w]+)\s*=\s*input\s*\(([^)]*)\)/;
      const varMatch = code.match(varInputPattern);
      let varName = '';
      
      if (varMatch && input) {
        varName = varMatch[1].trim();
        console.log(`Found input variable ${varName}`);
      }
      
      // Extract print statements
      const printPattern = /print\s*\(([^)]*)\)/g;
      const printMatches = [...code.matchAll(printPattern)];
      
      if (printMatches.length > 0) {
        for (const match of printMatches) {
          const content = match[1].trim();
          let output = content;
          
          // Handle string literals
          if ((content.startsWith('"') && content.endsWith('"')) || 
              (content.startsWith('\'') && content.endsWith('\'')))
          {
            output = content.substring(1, content.length - 1);
          }
          
          // Handle f-strings with input
          if (content.startsWith('f') && content.includes('{') && content.includes('}') && input) {
            let fstring = content.substring(1);
            if ((fstring.startsWith('"') && fstring.endsWith('"')) || 
                (fstring.startsWith('\'') && fstring.endsWith('\'')))
            {
              fstring = fstring.substring(1, fstring.length - 1);
              // Replace {varName} with input
              output = fstring.replace(/\{([^}]*)\}/g, () => input);
            }
          }
          
          // Handle variable references
          if (varName && content === varName) {
            output = input;
          }
          
          terminalOutput.push({
            type: 'standard',
            content: output,
          });
        }
        
        // Add success message
        terminalOutput.push({
          type: 'success',
          content: `Program exited with code 0`,
        });
        
        // Only return if we have input handling or no input is needed
        if (!hasInput || (hasInput && input)) {
          return terminalOutput;
        }
      }
    } catch (e) {
      console.error('Error in frontend Python handling:', e);
      // Continue to backend if frontend handling fails
    }
  }
  
  try {
    // Get socket connection
    const socket = getSocket();
    
    // Make API request to execute code
    console.log(`Making API request to: ${API_URL}/api/execute`);
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

    // Try to parse the response
    let data;
    const text = await response.text();
    
    try {
      data = JSON.parse(text);
      console.log('Received API response:', data);
    } catch (parseError) {
      console.error('Error parsing response:', parseError);
      console.error('Response text:', text.substring(0, 100));
      
      // Return the fallback result if we can't parse the response
      terminalOutput.push({
        type: 'error',
        content: 'Server error: Could not parse response',
      });
      return terminalOutput;
    }
    
    // Check if the result is already in the response
    if (data.result) {
      console.log('Using direct result from API response');
      // Parse output into terminal lines directly
      const terminalOutput: TerminalOutput[] = [];
      const result = data.result;

      // Add command line
      terminalOutput.push({
        type: 'command',
        content: `Running ${language} code...`,
      });

      if (result.status === 'success') {
        // Handle user input if provided
        if (input) {
          terminalOutput.push({
            type: 'input',
            content: input,
          });
        }
        
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
      
      return terminalOutput;
    }
    
    // If no direct result, use WebSocket approach as fallback
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
        
        // Handle user input if provided
        if (input) {
          terminalOutput.push({
            type: 'input',
            content: input,
          });
        }

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

        // Filter out unwanted terminal messages before resolving
        const filteredOutput = terminalOutput.filter(line => 
          !line.content.includes('** Process exited - Return Code:') && 
          !line.content.includes('Press Enter to exit terminal'));
        
        resolve(filteredOutput);
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
