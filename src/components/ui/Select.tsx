import { forwardRef, useId } from 'react'
import type { SelectHTMLAttributes } from 'react'
import { ChevronDown } from 'lucide-react'

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: SelectOption[]
  placeholder?: string | undefined
  helperText?: string | undefined
  errorText?: string | undefined
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      options,
      placeholder,
      helperText,
      errorText,
      id,
      className = '',
      ...rest
    },
    ref,
  ) => {
    const autoId = useId()
    const selectId = id ?? autoId
    const helperId = `${selectId}-helper`
    const errorId = `${selectId}-error`
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
          htmlFor={selectId}
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
          {rest.required && (
            <span className="ml-0.5 text-[var(--status-danger)]" aria-hidden>
              *
            </span>
          )}
        </label>

        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={[
              'h-11 w-full appearance-none rounded-md border bg-[var(--bg-surface)] px-3 pr-10',
              'text-sm text-[var(--text-primary)] transition-colors',
              'focus:outline-none focus:ring-2 focus:ring-[var(--color-tandon-t1)]/40',
              hasError
                ? 'border-[var(--status-danger)]'
                : 'border-[var(--border-strong)] focus:border-[var(--color-tandon-t1)]',
              rest.disabled ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer',
              className,
            ].join(' ')}
            aria-invalid={hasError || undefined}
            aria-describedby={describedBy || undefined}
            {...rest}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]"
            aria-hidden
          />
        </div>

        {helperText && !hasError && (
          <p id={helperId} className="mt-1.5 text-xs text-[var(--text-muted)]">
            {helperText}
          </p>
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

Select.displayName = 'Select'
