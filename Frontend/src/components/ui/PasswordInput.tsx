import { forwardRef, useState, type ComponentPropsWithoutRef } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '../../lib/utils';

type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, ...props }, ref) => {
    const [show, setShow] = useState(false);
    return (
      <div className="relative">
        <input
          ref={ref}
          type={show ? 'text' : 'password'}
          className={cn(
            'w-full pl-3 pr-10 py-2 rounded-lg bg-primary/5 border border-border text-primary text-sm placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-accent-brand',
            className,
          )}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide password' : 'Show password'}
          aria-pressed={show}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-secondary hover:text-primary transition-colors"
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      </div>
    );
  },
);

PasswordInput.displayName = 'PasswordInput';
