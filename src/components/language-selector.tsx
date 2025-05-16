import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ProgrammingLanguage = 'javascript' | 'python' | 'html' | 'java';

interface LanguageSelectorProps {
  selectedLanguage: ProgrammingLanguage;
  onChange: (language: ProgrammingLanguage) => void;
}

export function LanguageSelector({ selectedLanguage, onChange }: LanguageSelectorProps) {
  return (
    <div className="flex items-center">
      <span className="text-sm mr-2 text-muted-foreground">Language:</span>
      <Select 
        value={selectedLanguage} 
        onValueChange={(value) => onChange(value as ProgrammingLanguage)}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select a language" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="javascript">JavaScript</SelectItem>
          <SelectItem value="python">Python</SelectItem>
          <SelectItem value="html">HTML/CSS</SelectItem>
          <SelectItem value="java">Java</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}