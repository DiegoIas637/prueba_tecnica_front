import type { ReactNode } from 'react'

export function FieldError({ children }: { children: ReactNode }) {
  return <p className="mt-1.5 text-xs text-rose-500">{children}</p>
}
