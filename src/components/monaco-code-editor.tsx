import { useRef } from 'react';
import Editor, { Monaco, OnMount } from '@monaco-editor/react';
import { ProgrammingLanguage } from './language-selector';
import { cn } from '@/lib/utils';

interface MonacoCodeEditorProps {
  value: string;
  onChange: (code: string) => void;
  language: ProgrammingLanguage;
  className?: string;
}

// Map our language types to Monaco's language identifiers
const languageMap: Record<ProgrammingLanguage, string> = {
  python: 'python',
};

export function MonacoCodeEditor({ value, onChange, language, className }: MonacoCodeEditorProps) {
  const editorRef = useRef<any>(null);
  const monacoRef = useRef<Monaco | null>(null);

  // Handle editor mounting
  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Set editor options for better appearance
    editor.updateOptions({
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
      fontSize: 14,
      lineHeight: 22,
      fontLigatures: true,
      cursorBlinking: 'smooth',
      cursorSmoothCaretAnimation: 'on',
      roundedSelection: true,
      automaticLayout: true,
      padding: { top: 10 },
      renderLineHighlight: 'all',
    });

    // Focus the editor
    editor.focus();
  };

  // Configure Monaco theme
  const beforeMount = (monaco: Monaco) => {
    // Define a custom theme with better colors
    monaco.editor.defineTheme('codeTheme', {
      base: 'vs-dark',
      inherit: true,
      rules: [
        { token: 'comment', foreground: '6A9955', fontStyle: 'italic' },
        { token: 'keyword', foreground: 'C586C0', fontStyle: 'bold' },
        { token: 'string', foreground: 'CE9178' },
        { token: 'number', foreground: 'B5CEA8' },
        { token: 'function', foreground: 'DCDCAA' },
      ],
      colors: {
        'editor.background': '#1E1E1E',
        'editor.foreground': '#D4D4D4',
        'editorCursor.foreground': '#AEAFAD',
        'editor.lineHighlightBackground': '#2D2D30',
        'editor.selectionBackground': '#264F78',
        'editor.inactiveSelectionBackground': '#3A3D41',
      }
    });
  };

  return (
    <div className={cn("w-full h-full overflow-hidden rounded-md border", className)}>
      <Editor
        height="100%"
        width="100%"
        language={languageMap[language]}
        value={value}
        onChange={(value) => onChange(value || '')}
        onMount={handleEditorDidMount}
        beforeMount={beforeMount}
        theme="codeTheme"
        options={{
          wordWrap: 'on',
          tabSize: 2,
          renderWhitespace: 'selection',
          autoIndent: 'full',
          formatOnPaste: true,
          formatOnType: true,
          smoothScrolling: true,
          glyphMargin: false,
          folding: true,
          lineNumbersMinChars: 3,
          scrollbar: {
            verticalScrollbarSize: 12,
            horizontalScrollbarSize: 12,
          },
        }}
        loading={
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        }
      />
    </div>
  );
}
