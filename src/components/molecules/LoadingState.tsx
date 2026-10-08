import { Spinner } from '../atoms/Spinner'

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
      <Spinner className="size-5" /> {label}
    </div>
  )
}
