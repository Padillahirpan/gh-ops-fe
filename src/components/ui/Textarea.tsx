import { forwardRef, useId } from 'react'
import type { TextareaHTMLAttributes } from 'react'

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  helperText?: string | undefined
  errorText?: string | undefined
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    { label, helperText, errorText, id, className = '', rows = 3, ...rest },
    ref,
  ) => {
    const autoId = useId()
    const textareaId = id ?? autoId
    const helperId = `${textareaId}-helper`
    const errorId = `${textareaId}-error`
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
          htmlFor={textareaId}
          className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]"
        >
          {label}
          {rest.required && (
            <span className="ml-0.5 text-[var(--status-danger)]" aria-hidden>
              *
            </span>
          )}
        </label>

        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          className={[
            'w-full rounded-md border bg-[var(--bg-surface)] px-3 py-2.5',
            'text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
            'transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-tandon-t1)]/40',
            hasError
              ? 'border-[var(--status-danger)]'
              : 'border-[var(--border-strong)] focus:border-[var(--color-tandon-t1)]',
            rest.disabled ? 'opacity-60 cursor-not-allowed' : '',
            className,
          ].join(' ')}
          aria-invalid={hasError || undefined}
          aria-describedby={describedBy || undefined}
          {...rest}
        />

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

Textarea.displayName = 'Textarea'
