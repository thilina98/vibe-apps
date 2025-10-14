import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const toolColors: Record<string, string> = {
  "Replit Agent": "bg-[hsl(262,80%,50%)]/10 text-[hsl(262,80%,50%)] border-[hsl(262,80%,50%)]/20",
  "Bolt.new": "bg-[hsl(45,100%,51%)]/10 text-[hsl(45,90%,40%)] border-[hsl(45,100%,51%)]/20",
  "v0": "bg-[hsl(0,0%,15%)]/10 text-[hsl(0,0%,15%)] border-[hsl(0,0%,15%)]/20",
  "Cursor": "bg-[hsl(200,100%,45%)]/10 text-[hsl(200,100%,35%)] border-[hsl(200,100%,45%)]/20",
  "Claude": "bg-[hsl(33,82%,55%)]/10 text-[hsl(33,82%,45%)] border-[hsl(33,82%,55%)]/20",
  "ChatGPT": "bg-[hsl(171,65%,45%)]/10 text-[hsl(171,65%,35%)] border-[hsl(171,65%,45%)]/20",
  "Lovable": "bg-[hsl(340,75%,55%)]/10 text-[hsl(340,75%,45%)] border-[hsl(340,75%,55%)]/20",
  "Windsurf": "bg-[hsl(195,80%,48%)]/10 text-[hsl(195,80%,38%)] border-[hsl(195,80%,48%)]/20",
  "Other": "bg-muted/50 text-muted-foreground border-border",
};

export function getToolColor(tool: string): string {
  return toolColors[tool] || toolColors["Other"];
}
