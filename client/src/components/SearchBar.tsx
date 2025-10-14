import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/60" />
      <Input
        type="search"
        placeholder="Search by app name, creator, or tags..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-12 pr-4 h-14 text-base bg-white/10 backdrop-blur-md border-white/20 text-white placeholder:text-white/60 focus-visible:ring-white/40"
        data-testid="input-search"
      />
    </div>
  );
}
