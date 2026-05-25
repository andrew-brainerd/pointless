import { type HTMLAttributes } from 'react';
import { clsx } from 'clsx';

export type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({ className, ...rest }: CardProps) => (
  <div
    className={clsx(
      'rounded-xl border border-accent-200/15 bg-canvas-bottom/40 p-5 backdrop-blur',
      className,
    )}
    {...rest}
  />
);
