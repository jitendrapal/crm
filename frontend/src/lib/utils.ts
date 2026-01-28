import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return '$0.00';
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = new Date(date);

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(dateObj);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';

  const dateObj = new Date(date);

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(dateObj);
}
