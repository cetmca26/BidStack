import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | null | undefined): string {
  if (amount == null) return "₹0";
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function formatPriceCompact(amount: number | null | undefined): string {
  if (amount == null) return "₹0";

  if (amount >= 10000000) {
    return `₹${+(amount / 10000000).toFixed(2)}Cr`;
  } else if (amount >= 100000) {
    return `₹${+(amount / 100000).toFixed(2)}L`;
  } else if (amount >= 1000) {
    return `₹${+(amount / 1000).toFixed(2)}K`;
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}
