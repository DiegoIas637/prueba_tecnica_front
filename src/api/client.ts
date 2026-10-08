import type {
  AdvisorId,
  ApiErrorBody,
  ApiErrorCode,
  Plan,
  Sale,
  SaleRequest,
  SalesPage,
} from './types'

const BASE_URL = import.meta.env.VITE_API_URL ?? ''

/** Mensajes legibles por código de negocio (R5: errores comprensibles). */
const ERROR_MESSAGES: Record<ApiErrorCode, string> = {
  UNAUTHORIZED_ADVISOR: 'Asesor no válido. Selecciona el asesor A o B.',
  INVALID_SALE_DATA: 'Revisa el nombre, el email y la referencia del comprador.',
  PLAN_NOT_FOUND: 'El plan seleccionado ya no existe.',
  NO_QUOTA_AVAILABLE: 'No quedan cupos disponibles para este plan.',
  REFERENCE_CONFLICT:
    'Esa referencia ya se usó con datos distintos. Se conserva la venta original.',
  CONCURRENCY_CONFLICT:
    'Otro proceso tomó el cupo primero. Inténtalo de nuevo.',
  UNKNOWN: 'Ocurrió un error inesperado. Inténtalo de nuevo.',
}

export class ApiError extends Error {
  readonly code: ApiErrorCode
  readonly status: number

  constructor(code: ApiErrorCode, status: number, message?: string) {
    super(message ?? ERROR_MESSAGES[code] ?? ERROR_MESSAGES.UNKNOWN)
    this.name = 'ApiError'
    this.code = code
    this.status = status
  }
}

async function parseError(res: Response): Promise<ApiError> {
  let code: ApiErrorCode = 'UNKNOWN'
  try {
    const body = (await res.json()) as Partial<ApiErrorBody>
    if (body?.error?.code) code = body.error.code
  } catch {
    // respuesta sin cuerpo JSON
  }
  if (res.status === 401) code = 'UNAUTHORIZED_ADVISOR'
  return new ApiError(code, res.status, ERROR_MESSAGES[code])
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) throw await parseError(res)
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

function advisorHeaders(advisorId: AdvisorId): HeadersInit {
  return { 'X-Advisor-Id': advisorId }
}

/** R1 — Consultar planes (sin header de asesor). */
export function getPlans(): Promise<Plan[]> {
  return request<Plan[]>('/api/plans')
}

/** R2 / R3 — Registrar venta. */
export function createSale(
  advisorId: AdvisorId,
  body: SaleRequest,
): Promise<Sale> {
  return request<Sale>('/api/sales', {
    method: 'POST',
    headers: advisorHeaders(advisorId),
    body: JSON.stringify(body),
  })
}

/** R4 — Consultar ventas propias (paginado, 20 por página). */
export function getSales(
  advisorId: AdvisorId,
  page: number,
  pageSize = 20,
): Promise<SalesPage> {
  const qs = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
  })
  return request<SalesPage>(`/api/sales?${qs}`, {
    headers: advisorHeaders(advisorId),
  })
}
