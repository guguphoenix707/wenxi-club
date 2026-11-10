import { useId, type ComponentProps, type ReactNode } from 'react';
import { Input as UiInput } from '@/components/ui/input';
import './input.css';

type InputProps = ComponentProps<typeof UiInput> & {
  label: string;
  error?: string;
  hint?: string;
  suffix?: ReactNode;
};

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
    <div data-slot="field" data-type="standard">
      <label htmlFor={inputId}>{label}</label>
      <div data-slot="field-control" data-type="standard">
        <div data-slot="field-input">
          <UiInput
            {...props}
            id={inputId}
            className={className}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
          />
        </div>
        {suffix}
      </div>
      {hint ? <p id={hintId} data-slot="field-hint" data-type="standard">{hint}</p> : null}
      {error ? <p id={errorId} data-slot="field-error" data-type="standard" role="alert">{error}</p> : null}
    </div>
  );
}
