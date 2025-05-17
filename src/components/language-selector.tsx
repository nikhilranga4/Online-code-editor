import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ProgrammingLanguage = 'javascript' | 'python' | 'html' | 'java' | 'cpp' | 'c' | 'go' | 'ruby' | 'rust' | 'php';

export interface LanguageSelectorProps {
  value: ProgrammingLanguage;
  onChange: (language: ProgrammingLanguage) => void;
}

export function LanguageSelector({ value, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center">
      <span className="text-sm mr-2 text-muted-foreground">Language:</span>
      <Select 
        value={value} 
        onValueChange={(value) => onChange(value as ProgrammingLanguage)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="java">Java</SelectItem>
          <SelectItem value="cpp">C++</SelectItem>
          <SelectItem value="c">C</SelectItem>
          <SelectItem value="go">Go</SelectItem>
          <SelectItem value="ruby">Ruby</SelectItem>
          <SelectItem value="rust">Rust</SelectItem>
          <SelectItem value="php">PHP</SelectItem>
          <SelectItem value="html">HTML/CSS</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}