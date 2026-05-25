import { forwardRef, type InputHTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...rest }, ref) => (
  <input
    ref={ref}
    className={clsx(
      'w-full rounded-lg border border-accent-200/30 bg-canvas-bottom/40 px-3 py-2 text-sm text-white placeholder:text-accent-200/40 focus:border-accent-400 focus:outline-none',
      className,
    )}
    {...rest}
  />
));
Input.displayName = 'Input';
