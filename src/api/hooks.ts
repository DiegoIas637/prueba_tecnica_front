import {
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query'
import { createSale, getPlans, getSales } from './client'
import type { AdvisorId, SaleRequest } from './types'

export const queryKeys = {
  plans: ['plans'] as const,
  sales: (advisorId: AdvisorId, page: number) =>
    ['sales', advisorId, page] as const,
}

/** R1 — planes y disponibilidad. */
export function usePlans() {
  return useQuery({
    queryKey: queryKeys.plans,
    queryFn: getPlans,
  })
}

/** R4 — ventas del asesor activo, paginadas. */
export function useSales(advisorId: AdvisorId, page: number) {
  return useQuery({
    queryKey: queryKeys.sales(advisorId, page),
    queryFn: () => getSales(advisorId, page),
    placeholderData: (prev) => prev,
  })
}

/** R2 / R3 — registrar venta e invalidar planes + ventas al tener éxito. */
export function useCreateSale(advisorId: AdvisorId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body: SaleRequest) => createSale(advisorId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.plans })
      qc.invalidateQueries({ queryKey: ['sales', advisorId] })
    },
  })
}
