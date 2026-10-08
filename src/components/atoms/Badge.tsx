import type { ReactNode } from 'react'

type Tone = 'brand' | 'emerald' | 'amber' | 'rose'

const TONES: Record<Tone, string> = {
  brand: 'bg-brand-50 text-brand-600 border-violet-100',
  emerald: 'bg-emerald-100 text-emerald-600 border-emerald-200',
  amber: 'bg-amber-100 text-amber-600 border-amber-200',
  rose: 'bg-rose-100 text-rose-500 border-rose-200',
}

export function Badge({
  tone = 'brand',
  dot = false,
  children,
}: {
  tone?: Tone
  dot?: boolean
  children: ReactNode
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${TONES[tone]}`}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  )
}
