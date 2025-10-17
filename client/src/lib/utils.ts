import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const toolColors: Record<string, string> = {
  "Replit Agent": "bg-[hsl(240,8%,27%)]/10 text-[hsl(240,8%,27%)] border-[hsl(240,8%,27%)]/20",
  "Bolt.new": "bg-[hsl(240,6%,35%)]/10 text-[hsl(240,6%,25%)] border-[hsl(240,6%,35%)]/20",
  "v0": "bg-[hsl(0,0%,15%)]/10 text-[hsl(0,0%,15%)] border-[hsl(0,0%,15%)]/20",
  "Cursor": "bg-[hsl(240,5%,40%)]/10 text-[hsl(240,5%,30%)] border-[hsl(240,5%,40%)]/20",
  "Claude": "bg-[hsl(240,7%,32%)]/10 text-[hsl(240,7%,22%)] border-[hsl(240,7%,32%)]/20",
  "ChatGPT": "bg-[hsl(0,0%,45%)]/10 text-[hsl(0,0%,35%)] border-[hsl(0,0%,45%)]/20",
  "Lovable": "bg-[hsl(240,6%,38%)]/10 text-[hsl(240,6%,28%)] border-[hsl(240,6%,38%)]/20",
  "Windsurf": "bg-[hsl(240,5%,42%)]/10 text-[hsl(240,5%,32%)] border-[hsl(240,5%,42%)]/20",
  "Other": "bg-muted/50 text-muted-foreground border-border",
};

export function getToolColor(tool: string): string {
  return toolColors[tool] || toolColors["Other"];
}
