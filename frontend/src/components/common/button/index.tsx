import type { ComponentProps } from 'react';
import { Button as UiButton } from '@/components/ui/button';
import './button.css';

type UiButtonProps = Omit<ComponentProps<typeof UiButton>, 'className'> & {
  className?: string;
};

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
}

export function Button({
  variant = 'default',
  size = 'default',
  className,
  ...props
}: UiButtonProps) {
  return (
    <UiButton
      {...props}
      variant={variant}
      size={size}
      data-variant={variant}
      data-size={size}
      className={classes('bread-button', className)}
    />
  );
}
