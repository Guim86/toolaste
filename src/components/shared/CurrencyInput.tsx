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
  const [rawValue, setRawValue] = useState(String(value || ''));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isFocused) {
      setRawValue(value ? String(value) : '');
    }
  }, [value, isFocused]);

  const handleFocus = () => {
    setIsFocused(true);
    setRawValue(value ? String(value) : '');
  };

  const handleBlur = () => {
    setIsFocused(false);
    const parsed = parseItalianNumber(rawValue);
    onChange(parsed);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRawValue(e.target.value);
  };

  const displayValue = isFocused ? rawValue : (value ? formatCurrency(value, decimals) : '');

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
          type={isFocused ? 'number' : 'text'}
          value={displayValue}
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
