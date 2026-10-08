import { AnimatePresence, motion } from 'framer-motion'
import { RefreshCw, ShieldCheck } from 'lucide-react'
import { usePlans } from '../../api/hooks'
import type { Plan } from '../../api/types'
import { formatCOP } from '../../lib/format'
import { Card } from '../molecules/Card'
import { SectionTitle } from '../molecules/SectionTitle'
import { QuotaBadge } from '../molecules/QuotaBadge'
import { AlertMessage } from '../molecules/AlertMessage'
import { LoadingState } from '../molecules/LoadingState'

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const soldOut = plan.availableQuota <= 0
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className={`relative overflow-hidden rounded-2xl border p-4 ${
        soldOut
          ? 'border-slate-100 bg-slate-50/60'
          : 'border-violet-100 bg-gradient-to-br from-brand-50 to-mint-200/20'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-800">{plan.name}</p>
          <p className="mt-0.5 font-mono text-xs text-slate-400">{plan.code}</p>
        </div>
        <QuotaBadge quota={plan.availableQuota} />
      </div>
      <div className="mt-4 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-slate-800">
          {formatCOP(plan.premium)}
        </span>
        <span className="text-xs text-slate-400">/ venta</span>
      </div>
    </motion.div>
  )
}

export function PlansPanel() {
  const { data, isLoading, isError, error, refetch, isFetching } = usePlans()

  return (
    <Card className="p-5">
      <SectionTitle
        icon={<ShieldCheck className="size-5" />}
        title="Planes disponibles"
        subtitle="Prima y disponibilidad en tiempo real"
        action={
          <button
            type="button"
            onClick={() => refetch()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-violet-100 bg-white/60 px-2.5 py-1.5 text-xs text-slate-500 transition hover:bg-brand-50"
          >
            <RefreshCw className={`size-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        }
      />

      <div className="mt-5">
        {isLoading && <LoadingState label="Cargando planes…" />}

        {isError && <AlertMessage>{(error as Error).message}</AlertMessage>}

        {data && (
          <div className="grid gap-3 sm:grid-cols-2">
            <AnimatePresence>
              {data.map((plan, i) => (
                <PlanCard key={plan.code} plan={plan} index={i} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </Card>
  )
}
