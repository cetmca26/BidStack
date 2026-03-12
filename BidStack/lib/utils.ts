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
  if (amount == null || amount === 0) return "₹0.00";

  // Use absolute value for comparison to handle potential negatives
  const absAmount = Math.abs(amount);

  if (absAmount >= 10000000) {
    return `₹${(amount / 10000000).toFixed(2)} Cr`;
  } else if (absAmount >= 100000) {
    return `₹${(amount / 100000).toFixed(2)} L`;
  } else if (absAmount >= 1000) {
    return `₹${(amount / 1000).toFixed(2)} K`;
  }
  
  return `₹${amount.toFixed(2)}`;
}

// ─── Indian Currency: Number to Words ───

const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function twoDigitWords(n: number): string {
  if (n < 20) return ones[n];
  return (tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '')).trim();
}

function threeDigitWords(n: number): string {
  if (n === 0) return '';
  if (n < 100) return twoDigitWords(n);
  return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigitWords(n % 100) : '');
}

/**
 * Convert a number to Indian currency words.
 * e.g. 2500000 -> "Twenty Five Lakhs"
 *      15000   -> "Fifteen Thousand"
 *      10250000 -> "One Crore Two Lakh Fifty Thousand"
 */
export function numberToIndianWords(num: number | null | undefined): string {
  if (num == null || isNaN(num) || num === 0) return 'Zero';
  if (num < 0) return 'Minus ' + numberToIndianWords(Math.abs(num));

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const helper = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return (tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '')).trim();
    if (n < 1000) return (ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + helper(n % 100) : '')).trim();
    return '';
  };

  let remainder = Math.round(num);
  const parts: string[] = [];

  // 1. Crores (Recursive to handle 100, 1000+ Crores)
  if (remainder >= 10000000) {
    const crores = Math.floor(remainder / 10000000);
    parts.push(numberToIndianWords(crores) + (crores === 1 ? ' Crore' : ' Crores'));
    remainder %= 10000000;
  }

  // 2. Lakhs
  if (remainder >= 100000) {
    const lakhs = Math.floor(remainder / 100000);
    parts.push(helper(lakhs) + (lakhs === 1 ? ' Lakh' : ' Lakhs'));
    remainder %= 100000;
  }

  // 3. Thousands
  if (remainder >= 1000) {
    const thousands = Math.floor(remainder / 1000);
    parts.push(helper(thousands) + ' Thousand');
    remainder %= 1000;
  }

  // 4. Remaining Hundreds/Tens/Ones
  if (remainder > 0) {
    parts.push(helper(remainder));
  }

  return parts.join(' ').trim();
}