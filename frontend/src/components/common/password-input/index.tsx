import type { ComponentProps } from 'react';
import { Input } from '@/components/common/input';

type PasswordInputProps = Omit<ComponentProps<typeof Input>, 'type'>;

export function PasswordInput(props: PasswordInputProps) {
  return <Input type="password" {...props} />;
}
