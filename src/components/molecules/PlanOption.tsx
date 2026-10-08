import type { Plan } from '../../api/types'
import { formatCOP } from '../../lib/format'

export function PlanOption({
  plan,
  selected,
  onSelect,
}: {
  plan: Plan
  selected: boolean
  onSelect: (code: string) => void
}) {
  const disabled = plan.availableQuota <= 0
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onSelect(plan.code)}
      className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-left transition ${
        selected
          ? 'border-brand-300 bg-brand-50'
          : 'border-violet-100 bg-white/60 hover:border-brand-200'
      } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
    >
      <div>
        <p className="text-sm font-medium text-slate-800">{plan.name}</p>
        <p className="text-xs text-slate-400">
          {formatCOP(plan.premium)} ·{' '}
          {plan.availableQuota > 0
            ? `${plan.availableQuota} disponibles`
            : 'sin cupos'}
        </p>
      </div>
      <span
        className={`size-4 rounded-full border-2 ${
          selected ? 'border-brand-400 bg-brand-400' : 'border-violet-200'
        }`}
      />
    </button>
  )
}
