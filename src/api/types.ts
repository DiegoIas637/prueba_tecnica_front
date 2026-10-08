export type AdvisorId = 'A' | 'B'

export interface Plan {
  code: string
  name: string
  premium: number
  availableQuota: number
}

export interface SaleRequest {
  planCode: string
  buyerName: string
  buyerEmail: string
  requestReference: string
}

export interface Sale {
  id: string
  requestReference: string
  advisorId: AdvisorId
  planCode: string
  planName: string
  buyerName: string
  buyerEmail: string
  premium: number
  acceptedAt: string
}

export interface SaleListItem {
  id: string
  requestReference: string
  planName: string
  premium: number
  buyerName: string
  acceptedAt: string
}

export interface SalesPage {
  items: SaleListItem[]
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
}

export type ApiErrorCode =
  | 'UNAUTHORIZED_ADVISOR'
  | 'INVALID_SALE_DATA'
  | 'PLAN_NOT_FOUND'
  | 'NO_QUOTA_AVAILABLE'
  | 'REFERENCE_CONFLICT'
  | 'CONCURRENCY_CONFLICT'
  | 'UNKNOWN'

export interface ApiErrorBody {
  error: {
    code: ApiErrorCode
    message: string
  }
}
