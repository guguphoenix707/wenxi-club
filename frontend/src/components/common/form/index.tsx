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

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
}

export function Form({
  busy = false,
  error,
  actions,
  children,
  onSubmit,
  className,
  ...props
}: FormProps) {
  return (
    <form
      {...props}
      className={classes('bread-form', className)}
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
      {error ? <p className="bread-form-error" role="alert">{error}</p> : null}
      {actions}
    </form>
  );
}
