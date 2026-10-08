import { AlertTriangle } from 'lucide-react'
import type { ReactNode } from 'react'

export function AlertMessage({
  children,
  rounded = 'xl',
}: {
  children: ReactNode
  rounded?: 'xl' | '2xl'
}) {
  return (
    <div
      className={`flex items-start gap-2 border border-rose-200 bg-rose-50 p-4 text-sm text-rose-600 ${
        rounded === '2xl' ? 'rounded-2xl' : 'rounded-xl'
      }`}
    >
      <AlertTriangle className="mt-0.5 size-4 shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  )
}
