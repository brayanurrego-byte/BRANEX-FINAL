import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// BRANEX NUMBER PARSING & FORMATTING UTILITIES
// Handles both comma (es-ES/es-CO) and period (en-US) decimals
// ============================================================

/**
 * Parse a decimal value from user input, supporting both comma and period
 * as decimal separators. This is critical for Colombian/Spanish locales
 * where the user types "0,223" to mean 0.223.
 *
 * Rules:
 * - If the string contains BOTH dots and commas, the LAST one is the decimal separator
 * - "1.234,56" → 1234.56  (es-ES thousands + decimal)
 * - "1,234.56" → 1234.56  (en-US thousands + decimal)
 * - "0,223"    → 0.223    (es-ES decimal only)
 * - "0.223"    → 0.223    (en-US decimal only)
 * - "1.234"    → 1.234    (ambiguous, treated as en-US decimal — safe for fractional shares)
 * - ""         → 0
 */
export function parseDecimal(value: string | number): number {
  if (typeof value === 'number') return isNaN(value) ? 0 : value
  if (!value || typeof value !== 'string') return 0

  // Remove everything except digits, dots, commas, and minus
  let cleaned = value.replace(/[^0-9.,-]/g, '')
  if (!cleaned) return 0

  // Handle negative
  const isNegative = cleaned.startsWith('-')
  cleaned = cleaned.replace(/-/g, '')

  const hasDot = cleaned.includes('.')
  const hasComma = cleaned.includes(',')

  let result: string

  if (hasDot && hasComma) {
    // Both present — last one is the decimal separator
    const lastDot = cleaned.lastIndexOf('.')
    const lastComma = cleaned.lastIndexOf(',')
    if (lastComma > lastDot) {
      // Format: 1.234,56 → comma is decimal
      result = cleaned.replace(/\./g, '').replace(',', '.')
    } else {
      // Format: 1,234.56 → dot is decimal
      result = cleaned.replace(/,/g, '')
    }
  } else if (hasComma) {
    // Only comma — treat as decimal separator
    // "0,223" → "0.223", "1,5" → "1.5"
    // Handle multiple commas (e.g., "1,234,567" — thousands separators)
    const parts = cleaned.split(',')
    if (parts.length === 2) {
      result = cleaned.replace(',', '.')
    } else {
      // Multiple commas = thousands separators, no decimals
      result = cleaned.replace(/,/g, '')
    }
  } else {
    // Only dots or no separators — standard JS number
    result = cleaned
  }

  const num = parseFloat(result)
  if (isNaN(num)) return 0
  return isNegative ? -num : num
}

/**
 * Format a dollar/currency value using es-ES locale (comma decimal, dot thousands)
 * Example: 1234.56 → "1.234,56"
 */
export function formatDollar(num: number): string {
  return num.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

/**
 * Format a quantity (shares) — show up to 8 decimal places, remove trailing zeros.
 * Uses dot as decimal separator for unambiguous display of fractional shares.
 * Example: 0.223 → "0.223", 10 → "10", 0.00125 → "0.00125"
 */
export function formatQuantity(num: number): string {
  if (num === 0) return '0'
  // For whole numbers, show no decimals
  if (Number.isInteger(num)) return num.toLocaleString('es-ES')
  // For fractional, show up to 8 decimal places removing trailing zeros
  const formatted = num.toFixed(8).replace(/\.?0+$/, '')
  return formatted || '0'
}

/**
 * Format a percentage value
 * Example: 12.345 → "12.35%"
 */
export function formatPercent(num: number): string {
  return num.toFixed(2) + '%'
}

/**
 * Format a number for general display using es-ES locale
 * Example: 1234 → "1.234"
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat('es-ES').format(num)
}

/**
 * Format currency with full options
 * Example: 1234.567 → "1.234,57"
 */
export function formatCurrency(num: number): string {
  return new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num)
}
