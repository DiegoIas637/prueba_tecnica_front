import type { AdvisorId } from '../api/types'

const cop = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

export function formatCOP(value: number): string {
  return cop.format(value)
}

const dateFmt = new Intl.DateTimeFormat('es-CO', {
  dateStyle: 'medium',
  timeStyle: 'short',
})

export function formatDate(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return dateFmt.format(d)
}

/**
 * Formato de referencia documentado: REF-<ASESOR>-<YYYYMMDD>-<4 aleatorios>
 * La unicidad se evalúa por asesor en el backend; aquí solo generamos un
 * valor nuevo para cada compra nueva (R5).
 */
export function generateReference(advisorId: AdvisorId): string {
  const now = new Date()
  const stamp =
    now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0')
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase()
  return `REF-${advisorId}-${stamp}-${rand}`
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}
