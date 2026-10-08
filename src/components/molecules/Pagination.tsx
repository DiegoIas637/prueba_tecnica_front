import { ChevronLeft, ChevronRight } from 'lucide-react'

function PagerButton({
  children,
  disabled,
  onClick,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1 rounded-lg border border-violet-100 bg-white/60 px-3 py-1.5 text-xs text-slate-600 transition hover:bg-brand-50 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function Pagination({
  page,
  totalPages,
  isFetching,
  onPrev,
  onNext,
}: {
  page: number
  totalPages: number
  isFetching?: boolean
  onPrev: () => void
  onNext: () => void
}) {
  return (
    <div className="mt-4 flex items-center justify-between border-t border-violet-50 pt-4">
      <span className="text-xs text-slate-400">
        Página {page} de {totalPages}
        {isFetching && <span className="ml-2 text-slate-500">· …</span>}
      </span>
      <div className="flex gap-2">
        <PagerButton disabled={page <= 1} onClick={onPrev}>
          <ChevronLeft className="size-4" /> Anterior
        </PagerButton>
        <PagerButton disabled={page >= totalPages} onClick={onNext}>
          Siguiente <ChevronRight className="size-4" />
        </PagerButton>
      </div>
    </div>
  )
}
