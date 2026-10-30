import type { ComponentProps } from 'react';
import { Button as UiButton } from '@/components/ui/button';
import './button.css';

type UiButtonProps = ComponentProps<typeof UiButton>;

export function Button({
  variant = 'default',
  size = 'default',
  ...props
}: UiButtonProps) {
  return (
    <UiButton
      variant={variant}
      size={size}
      {...props}
      data-type="standard"
      data-variant={variant}
      data-size={size}
    />
  );
}
