import { useState } from 'react'
import { useCreateSale } from '../api/hooks'
import { ApiError } from '../api/client'
import type { AdvisorId, Sale } from '../api/types'
import { generateReference, isValidEmail } from '../lib/format'

/**
 * Lógica del formulario de venta (R2/R3/R5): estado de campos, validación,
 * envío, reintento conservando referencia y datos, y nueva compra con
 * referencia nueva. Se separa de la vista para mantener el organismo delgado.
 */
export function useSaleForm(advisorId: AdvisorId) {
  const mutation = useCreateSale(advisorId)

  const [planCode, setPlanCode] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [buyerEmail, setBuyerEmail] = useState('')
  const [reference, setReference] = useState(() => generateReference(advisorId))
  const [touched, setTouched] = useState(false)
  const [lastAdvisor, setLastAdvisor] = useState(advisorId)

  // Nueva referencia al cambiar de asesor (compra nueva => referencia nueva).
  if (lastAdvisor !== advisorId) {
    setLastAdvisor(advisorId)
    setReference(generateReference(advisorId))
    mutation.reset()
  }

  const nameOk = buyerName.trim().length >= 2
  const emailOk = isValidEmail(buyerEmail)
  const planOk = planCode.length > 0
  const refOk = reference.trim().length > 0
  const formOk = nameOk && emailOk && planOk && refOk

  function payload() {
    return {
      planCode,
      buyerName: buyerName.trim(),
      buyerEmail: buyerEmail.trim(),
      requestReference: reference.trim(),
    }
  }

  function submit() {
    setTouched(true)
    if (!formOk) return
    mutation.mutate(payload())
  }

  // R5: reintentar con la misma referencia y datos (idempotencia en backend).
  function retry() {
    mutation.mutate(payload())
  }

  function newSale() {
    mutation.reset()
    setPlanCode('')
    setBuyerName('')
    setBuyerEmail('')
    setReference(generateReference(advisorId))
    setTouched(false)
  }

  function regenerateReference() {
    setReference(generateReference(advisorId))
  }

  return {
    // valores
    planCode,
    buyerName,
    buyerEmail,
    reference,
    touched,
    // setters
    setPlanCode,
    setBuyerName,
    setBuyerEmail,
    setReference,
    // validación por campo
    errors: {
      plan: touched && !planOk ? 'Selecciona un plan.' : undefined,
      name: touched && !nameOk ? 'Ingresa un nombre válido.' : undefined,
      email: touched && !emailOk ? 'Ingresa un email válido.' : undefined,
      reference: touched && !refOk ? 'Ingresa una referencia.' : undefined,
    },
    // acciones
    submit,
    retry,
    newSale,
    regenerateReference,
    // estado de la mutación
    isPending: mutation.isPending,
    sale: mutation.data as Sale | undefined,
    error: mutation.error as ApiError | Error | undefined,
  }
}
