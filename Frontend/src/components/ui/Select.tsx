import { useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  size?: 'sm' | 'md';
  className?: string;
  id?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

const TRIGGER_SIZE: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

const ITEM_SIZE: Record<NonNullable<SelectProps['size']>, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-3 py-2 text-sm',
};

export const Select = ({
  value,
  onChange,
  options,
  placeholder = 'Select…',
  size = 'sm',
  className,
  id,
  disabled = false,
  'aria-label': ariaLabel,
}: SelectProps) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const selected = options.find((o) => o.value === value);

  useEffect(() => {
    if (!open) return;
    const onMouseDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  useEffect(() => {
    if (open) {
      const idx = options.findIndex((o) => o.value === value);
      setHighlight(idx >= 0 ? idx : 0);
    }
  }, [open, value, options]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const el = listRef.current.querySelector<HTMLElement>(`[data-index="${highlight}"]`);
    el?.scrollIntoView({ block: 'nearest' });
  }, [highlight, open]);

  const commit = (val: string) => {
    onChange(val);
    setOpen(false);
    buttonRef.current?.focus();
  };

  const onKey = (e: ReactKeyboardEvent) => {
    if (disabled) return;
    if (!open) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setOpen(false);
        return;
      case 'ArrowDown':
        e.preventDefault();
        setHighlight((h) => Math.min(options.length - 1, h + 1));
        return;
      case 'ArrowUp':
        e.preventDefault();
        setHighlight((h) => Math.max(0, h - 1));
        return;
      case 'Home':
        e.preventDefault();
        setHighlight(0);
        return;
      case 'End':
        e.preventDefault();
        setHighlight(options.length - 1);
        return;
      case 'Enter': {
        e.preventDefault();
        const opt = options[highlight];
        if (opt) commit(opt.value);
        return;
      }
      case 'Tab':
        setOpen(false);
        return;
      default:
        return;
    }
  };

  return (
    <div ref={wrapRef} className={cn('relative', className)}>
      <button
        ref={buttonRef}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onKey}
        className={cn(
          'inline-flex items-center justify-between gap-2 w-full rounded-lg bg-primary/5 border border-border text-primary focus:outline-none focus:ring-1 focus:ring-accent-brand transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
          TRIGGER_SIZE[size],
        )}
      >
        <span className={cn('truncate', selected ? 'text-primary' : 'text-muted')}>
          {selected?.label ?? placeholder}
        </span>
        <ChevronDown
          size={size === 'md' ? 16 : 14}
          className={cn('text-secondary transition-transform shrink-0', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <ul
          ref={listRef}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute z-30 mt-1 w-full max-h-60 overflow-y-auto rounded-lg bg-sidebar border border-border shadow-lg py-1"
        >
          {options.map((opt, i) => {
            const isSelected = opt.value === value;
            const isHighlighted = i === highlight;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                data-index={i}
                onMouseEnter={() => setHighlight(i)}
                onMouseDown={(e) => {
                  e.preventDefault();
                  commit(opt.value);
                }}
                className={cn(
                  'flex items-center justify-between gap-2 cursor-pointer transition-colors',
                  ITEM_SIZE[size],
                  isHighlighted ? 'bg-primary/5 text-primary' : 'text-primary/80',
                )}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected ? (
                  <Check size={size === 'md' ? 14 : 12} className="text-accent-brand shrink-0" />
                ) : null}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
};
