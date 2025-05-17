export type TerminalOutputType = 'standard' | 'error' | 'warning' | 'success' | 'info' | 'command' | 'input-request' | 'input';

export interface TerminalOutput {
  type: TerminalOutputType;
  content: string;
}