import type { ReactNode } from 'react'

export function EmptyState({
  icon,
  message,
}: {
  icon: ReactNode
  message: string
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
      {icon}
      <p className="text-sm">{message}</p>
    </div>
  )
}
