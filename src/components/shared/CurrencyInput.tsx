import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { formatCurrency, parseItalianNumber } from '@/utils/formatting';

interface CurrencyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Formats a raw string with Italian thousands separators in real-time.
 * Accepts only digits, commas (decimal sep), and minus.
 */
function formatLiveItalian(raw: string): string {
  // Remove everything except digits, comma, minus
  let cleaned = raw.replace(/[^\d,\-]/g, '');

  // Only allow one minus at start
  const negative = cleaned.startsWith('-');
  cleaned = cleaned.replace(/-/g, '');

  // Only allow one comma
  const parts = cleaned.split(',');
  let intPart = parts[0] || '';
  const decPart = parts.length > 1 ? parts.slice(1).join('') : null;

  // Remove leading zeros (but keep at least one digit)
  intPart = intPart.replace(/^0+(?=\d)/, '');

  // Add thousand separators (dots)
  if (intPart.length > 3) {
    intPart = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  let result = (negative ? '-' : '') + intPart;
  if (decPart !== null) {
    result += ',' + decPart;
  }
  return result;
}

export function CurrencyInput({
  value,
  onChange,
  label,
  suffix = '€',
  decimals = 0,
  className = '',
  placeholder,
  disabled,
}: CurrencyInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [displayText, setDisplayText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Sync display from external value when not focused
  useEffect(() => {
    if (!isFocused) {
      setDisplayText(value ? formatCurrency(value, decimals) : '');
    }
  }, [value, isFocused, decimals]);

  const handleFocus = () => {
    setIsFocused(true);
    // Show current value formatted in Italian style for editing
    setDisplayText(value ? formatCurrency(value, decimals) : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseItalianNumber(displayText);
    onChange(parsed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatLiveItalian(raw);
    setDisplayText(formatted);
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-xs font-medium text-muted-foreground mb-1">
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          ref={inputRef}
          type="text"
          inputMode="decimal"
          value={displayText}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder ?? '0'}
          disabled={disabled}
          className="pr-8 font-mono text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">
          {suffix}
        </span>
      </div>
    </div>
  );
}
