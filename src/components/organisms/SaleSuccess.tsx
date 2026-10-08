import { motion } from 'framer-motion'
import { CheckCircle2, Sparkles } from 'lucide-react'
import type { Sale } from '../../api/types'
import { formatCOP, formatDate } from '../../lib/format'
import { Button } from '../atoms/Button'
import { Field } from '../molecules/Field'

export function SaleSuccess({
  sale,
  onNewSale,
}: {
  sale: Sale
  onNewSale: () => void
}) {
  return (
    <motion.div
      key="success"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-5"
    >
      <div className="flex items-center gap-2 text-emerald-600">
        <CheckCircle2 className="size-5" />
        <span className="font-semibold">Venta aceptada</span>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
        <Field label="Plan" value={sale.planName} />
        <Field label="Prima" value={formatCOP(sale.premium)} />
        <Field label="Comprador" value={sale.buyerName} />
        <Field label="Email" value={sale.buyerEmail} />
        <Field label="Referencia" value={sale.requestReference} mono />
        <Field label="ID venta" value={sale.id} mono />
        <Field
          label="Aceptada"
          value={formatDate(sale.acceptedAt)}
          className="col-span-2"
        />
      </dl>
      <Button onClick={onNewSale} className="mt-5 px-4 py-2">
        <Sparkles className="size-4" />
        Nueva venta
      </Button>
    </motion.div>
  )
}
