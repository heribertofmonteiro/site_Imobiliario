import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return "¥ 0";
  const numValue = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(numValue)) return "¥ 0";
  return `¥ ${numValue.toLocaleString("ja-JP")}`;
}
