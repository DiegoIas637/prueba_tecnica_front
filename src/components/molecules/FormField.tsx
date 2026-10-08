import type { ReactNode } from 'react'
import { Label } from '../atoms/Label'
import { TextInput } from '../atoms/TextInput'
import { FieldError } from '../atoms/FieldError'

interface FormFieldProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  mono?: boolean
  error?: string
  /** Elemento opcional a la derecha del input (ej. botón). */
  addon?: ReactNode
  /** Texto de ayuda bajo el campo. */
  hint?: ReactNode
}

export function FormField({
  label,
  value,
  onChange,
  placeholder,
  type,
  mono,
  error,
  addon,
  hint,
}: FormFieldProps) {
  return (
    <div>
      <Label>{label}</Label>
      {addon ? (
        <div className="flex gap-2">
          <TextInput
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            type={type}
            mono={mono}
            invalid={!!error}
          />
          {addon}
        </div>
      ) : (
        <TextInput
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          type={type}
          mono={mono}
          invalid={!!error}
        />
      )}
      {hint && <p className="mt-1.5 text-xs text-slate-500">{hint}</p>}
      {error && <FieldError>{error}</FieldError>}
    </div>
  )
}
