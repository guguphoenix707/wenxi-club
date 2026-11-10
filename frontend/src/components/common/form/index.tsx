import type { ComponentProps, ReactNode } from 'react';
import './form.css';

type FormProps = ComponentProps<'form'> & {
  busy?: boolean;
  error?: string;
  actions?: ReactNode;
};

export function readFormString(form: FormData, name: string) {
  const value = form.get(name);
  return typeof value === 'string' ? value : '';
}

export function Form({
  busy = false,
  error,
  actions,
  children,
  onSubmit,
  ...props
}: FormProps) {
  return (
    <form
      {...props}
      data-slot="form"
      data-type="standard"
      aria-busy={busy || undefined}
      onSubmit={(event) => {
        if (busy) {
          event.preventDefault();
          return;
        }
        onSubmit?.(event);
      }}
    >
      {children}
      {error ? <p data-slot="form-error" data-type="standard" role="alert">{error}</p> : null}
      {actions}
    </form>
  );
}
