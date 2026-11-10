import { useId, type ComponentProps, type ReactNode } from 'react';
import { Input as UiInput } from '@/components/ui/input';
import './input.css';

type InputProps = ComponentProps<typeof UiInput> & {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
};

function classes(...names: Array<string | undefined>) {
  return names.filter(Boolean).join(' ');
}

export function Input({
  label,
  error,
  hint,
  suffix,
  id,
  className,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = hint ? `${inputId}-hint` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="bread-input">
      <label className="bread-input-label" htmlFor={inputId}>{label}</label>
      <div className="bread-input-control">
        <div className="bread-input-field">
          <UiInput
            {...props}
            id={inputId}
            className={classes('bread-input-native', className)}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
        </div>
        {suffix}
      </div>
      {hint ? <p id={hintId} className="bread-input-hint">{hint}</p> : null}
      {error ? <p id={errorId} className="bread-input-error" role="alert">{error}</p> : null}
    </div>
  );
}
