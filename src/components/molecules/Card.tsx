import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={`rounded-3xl border border-violet-100 bg-white/80 shadow-xl shadow-violet-200/30 backdrop-blur-sm ${className}`}
    >
      {children}
    </div>
  )
}
