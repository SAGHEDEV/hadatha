import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateEventHex(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const segment1 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const segment2 = Array.from({ length: 5 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${segment1}-${segment2}`;
}

export function extractEventHex(tags: string[]): string | null {
  const hexTag = tags.find(tag => tag.startsWith('hex:'));
  return hexTag ? hexTag.replace('hex:', '') : null;
}
