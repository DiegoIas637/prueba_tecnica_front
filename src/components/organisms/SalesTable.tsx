import { motion } from 'framer-motion'
import { Inbox, ReceiptText } from 'lucide-react'
import { useState } from 'react'
import { useSales } from '../../api/hooks'
import { useAdvisor } from '../../context/AdvisorContext'
import { formatCOP, formatDate } from '../../lib/format'
import { Badge } from '../atoms/Badge'
import { AlertMessage } from '../molecules/AlertMessage'
import { Card } from '../molecules/Card'
import { EmptyState } from '../molecules/EmptyState'
import { LoadingState } from '../molecules/LoadingState'
import { Pagination } from '../molecules/Pagination'
import { SectionTitle } from '../molecules/SectionTitle'

export function SalesTable() {
  const { advisorId } = useAdvisor()
  const [page, setPage] = useState(1)
  const [lastAdvisor, setLastAdvisor] = useState(advisorId)

  // Al cambiar de asesor, volver a la primera página (derivado en render).
  if (lastAdvisor !== advisorId) {
    setLastAdvisor(advisorId)
    setPage(1)
  }

  const { data, isLoading, isError, error, isFetching } = useSales(
    advisorId,
    page,
  )

  const totalPages = data?.totalPages ?? 1

  return (
    <Card className="p-5">
      <SectionTitle
        icon={<ReceiptText className="size-5" />}
        title="Mis ventas"
        subtitle={`Historial del asesor ${advisorId} · más recientes primero`}
        action={
          data && (
            <Badge tone="brand">
              {data.totalCount.toLocaleString('es-CO')} ventas
            </Badge>
          )
        }
      />

      <div className="mt-5 min-h-[220px]">
        {isLoading && <LoadingState label="Cargando ventas…" />}

        {isError && <AlertMessage>{(error as Error).message}</AlertMessage>}

        {data && data.items.length === 0 && (
          <EmptyState
            icon={<Inbox className="size-8" />}
            message="Aún no hay ventas registradas."
          />
        )}

        {data && data.items.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-slate-400">
                  <th className="pb-3 font-medium">Comprador</th>
                  <th className="pb-3 font-medium">Plan</th>
                  <th className="pb-3 text-right font-medium">Prima</th>
                  <th className="hidden pb-3 font-medium sm:table-cell">
                    Referencia
                  </th>
                  <th className="pb-3 text-right font-medium">Fecha</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.02 }}
                    className="border-t border-violet-50 text-slate-600 transition hover:bg-brand-50/50"
                  >
                    <td className="py-3 pr-3 font-medium text-slate-800">
                      {s.buyerName}
                    </td>
                    <td className="py-3 pr-3 text-slate-600">{s.planName}</td>
                    <td className="py-3 pr-3 text-right tabular-nums">
                      {formatCOP(s.premium)}
                    </td>
                    <td className="hidden py-3 pr-3 font-mono text-xs text-slate-400 sm:table-cell">
                      {s.requestReference}
                    </td>
                    <td className="py-3 text-right text-xs text-slate-400">
                      {formatDate(s.acceptedAt)}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {data && totalPages > 1 && (
        <Pagination
          page={page}
          totalPages={totalPages}
          isFetching={isFetching}
          onPrev={() => setPage((p) => p - 1)}
          onNext={() => setPage((p) => p + 1)}
        />
      )}
    </Card>
  )
}
