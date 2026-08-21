import { forwardRef, useId } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
  label: string
  helperText?: string | undefined
  errorText?: string | undefined
  prefix?: ReactNode | undefined
  suffix?: ReactNode | undefined
  hint?: string | undefined
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    { label, helperText, errorText, prefix, suffix, hint, id, className = '', ...rest },
    ref,
  ) => {
    const autoId = useId()
    const inputId = id ?? autoId
    const helperId = `${inputId}-helper`
    const errorId = `${inputId}-error`
    const hasError = Boolean(errorText)

    const describedBy = [
      helperText ? helperId : null,
      hasError ? errorId : null,
    ]
      .filter(Boolean)
      .join(' ')

    return (
      <div className="w-full">
        <label
          htmlFor={inputId}
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
          {rest.required && (
            <span className="ml-0.5 text-[var(--status-danger)]" aria-hidden>
              *
            </span>
          )}
        </label>

        <div
          className={[
            'flex items-center rounded-md border bg-[var(--bg-surface)] transition-colors',
            'focus-within:ring-2 focus-within:ring-[var(--color-tandon-t1)]/40',
            hasError
              ? 'border-[var(--status-danger)]'
              : 'border-[var(--border-strong)] focus-within:border-[var(--color-tandon-t1)]',
            rest.disabled ? 'opacity-60 cursor-not-allowed' : '',
          ].join(' ')}
        >
          {prefix && (
            <span className="pl-3 text-sm text-[var(--text-muted)]" aria-hidden>
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={[
              'h-11 w-full bg-transparent px-3 text-sm text-[var(--text-primary)]',
              'placeholder:text-[var(--text-muted)] focus:outline-none',
              prefix ? 'pl-2' : '',
              suffix ? 'pr-1' : '',
              rest.type === 'number'
                ? 'font-mono tabular-nums text-right'
                : '',
              className,
            ].join(' ')}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy || undefined}
            {...rest}
          />
          {suffix && (
            <span
              className="pr-3 text-sm font-medium text-[var(--text-muted)]"
              aria-hidden
            >
              {suffix}
            </span>
          )}
        </div>

        {helperText && !hasError && (
          <p id={helperId} className="mt-1.5 text-xs text-[var(--text-muted)]">
            {helperText}
          </p>
        )}
        {hint && !helperText && !hasError && (
          <p className="mt-1.5 text-xs text-[var(--text-muted)]">{hint}</p>
        )}
        {hasError && (
          <p id={errorId} role="alert" className="mt-1.5 text-xs text-[var(--status-danger)]">
            {errorText}
          </p>
        )}
      </div>
    )
  },
)

Input.displayName = 'Input'
