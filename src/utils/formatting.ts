/**
 * Formats a number in Italian style: dot for thousands, comma for decimals.
 */
export function formatCurrency(value: number, decimals = 0): string {
  if (isNaN(value) || !isFinite(value)) return '0';
  return value.toLocaleString('it-IT', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function formatEuro(value: number, decimals = 0): string {
  return `€ ${formatCurrency(value, decimals)}`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${formatCurrency(value, decimals)}%`;
}

/**
 * Parses an Italian-formatted number string back to a number.
 * Removes dots (thousands) and replaces comma with period (decimal).
 */
export function parseItalianNumber(input: string): number {
  if (!input) return 0;
  const cleaned = input.replace(/\./g, '').replace(',', '.').replace(/[^\d.\-]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}
