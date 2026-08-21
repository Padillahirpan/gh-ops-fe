import { forwardRef } from 'react'
import { CalendarDays } from 'lucide-react'
import type { InputProps } from './Input'
import { Input } from './Input'

export type DatePickerProps = Omit<InputProps, 'type' | 'prefix' | 'suffix'>

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <div className="relative">
        <Input
          ref={ref}
          type="date"
          className={`date-input-native ${className}`}
          {...props}
        />
        <CalendarDays
          className="date-input-icon pointer-events-none absolute right-3 h-4 w-4 text-[var(--text-muted)]"
          aria-hidden
        />
      </div>
    )
  },
)

DatePicker.displayName = 'DatePicker'
