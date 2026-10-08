import type { ReactNode } from 'react'

/**
 * Template: define la estructura de la página (header, main en dos columnas,
 * footer) sin saber qué contenido concreto va en cada slot.
 */
export function AppLayout({
  header,
  primary,
  aside,
  footer,
}: {
  header: ReactNode
  primary: ReactNode
  aside: ReactNode
  footer: ReactNode
}) {
  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-8 sm:px-6 lg:py-12">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {header}
      </header>

      <main className="mt-8 grid gap-5 lg:grid-cols-5">
        <div className="flex flex-col gap-5 lg:col-span-3">{primary}</div>
        <div className="lg:col-span-2">
          <div className="lg:sticky lg:top-8">{aside}</div>
        </div>
      </main>

      <footer className="mt-10 text-center text-xs text-slate-400">
        {footer}
      </footer>
    </div>
  )
}
