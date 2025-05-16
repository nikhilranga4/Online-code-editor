export type TerminalOutputType = 'standard' | 'error' | 'warning' | 'success' | 'info' | 'command';

export interface TerminalOutput {
  type: TerminalOutputType;
  content: string;
}