import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export type ProgrammingLanguage = 'python';

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
          <SelectItem value="python">Python</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}