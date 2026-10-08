import { AnimatePresence, motion } from 'framer-motion'
import { RotateCcw, Send } from 'lucide-react'
import { usePlans } from '../../api/hooks'
import { useAdvisor } from '../../context/AdvisorContext'
import { useSaleForm } from '../../hooks/useSaleForm'
import { Button } from '../atoms/Button'
import { FieldError } from '../atoms/FieldError'
import { Label } from '../atoms/Label'
import { Spinner } from '../atoms/Spinner'
import { Card } from '../molecules/Card'
import { FormField } from '../molecules/FormField'
import { PlanOption } from '../molecules/PlanOption'
import { SectionTitle } from '../molecules/SectionTitle'
import { SaleSuccess } from './SaleSuccess'

export function SaleForm() {
  const { advisorId } = useAdvisor()
  const { data: plans } = usePlans()
  const form = useSaleForm(advisorId)

  return (
    <Card className="p-5">
      <SectionTitle
        icon={<Send className="size-5" />}
        title="Registrar venta"
        subtitle={`Vendiendo como asesor ${advisorId}`}
      />

      <AnimatePresence mode="wait">
        {form.sale ? (
          <SaleSuccess sale={form.sale} onNewSale={form.newSale} />
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={(e) => {
              e.preventDefault()
              form.submit()
            }}
            className="mt-5 space-y-4"
          >
            <div>
              <Label>Plan</Label>
              <div className="grid grid-cols-1 gap-2">
                {plans?.map((p) => (
                  <PlanOption
                    key={p.code}
                    plan={p}
                    selected={form.planCode === p.code}
                    onSelect={form.setPlanCode}
                  />
                ))}
              </div>
              {form.errors.plan && <FieldError>{form.errors.plan}</FieldError>}
            </div>

            <FormField
              label="Nombre del comprador"
              value={form.buyerName}
              onChange={form.setBuyerName}
              placeholder="Juan Pérez"
              error={form.errors.name}
            />

            <FormField
              label="Email del comprador"
              value={form.buyerEmail}
              onChange={form.setBuyerEmail}
              placeholder="juan@ejemplo.test"
              type="email"
              error={form.errors.email}
            />

            <FormField
              label="Referencia de solicitud"
              value={form.reference}
              onChange={form.setReference}
              mono
              error={form.errors.reference}
              hint="Reusar la misma referencia con los mismos datos recupera la venta previa sin consumir cupo."
              addon={
                <button
                  type="button"
                  onClick={form.regenerateReference}
                  title="Generar nueva referencia"
                  className="shrink-0 rounded-lg border border-violet-100 bg-white/60 px-3 text-slate-500 transition hover:bg-brand-50"
                >
                  <RotateCcw className="size-4" />
                </button>
              }
            />

            {form.error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-2xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-600"
              >
                <div className="flex-1">
                  <p>{form.error.message}</p>
                  <button
                    type="button"
                    onClick={form.retry}
                    className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-rose-100 px-2.5 py-1 text-xs font-medium text-rose-600 transition hover:bg-rose-200"
                  >
                    <RotateCcw className="size-3.5" />
                    Reintentar con la misma referencia
                  </button>
                </div>
              </motion.div>
            )}

            <Button type="submit" fullWidth disabled={form.isPending} className="py-3">
              {form.isPending ? (
                <>
                  <Spinner className="size-4" /> Enviando…
                </>
              ) : (
                <>
                  <Send className="size-4" /> Registrar venta
                </>
              )}
            </Button>
          </motion.form>
        )}
      </AnimatePresence>
    </Card>
  )
}
