import { afterEach, describe, expect, it, vi } from 'vitest'
import { ApiError, createSale, getPlans, getSales } from './client'
import type { Plan, Sale, SalesPage } from './types'
import {
  headersFromCall,
  mockFetchOnce,
  mockFetchReject,
} from '../test/fetchMock'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

// ───────────────────────────── R1 — GET /api/plans ──────────────────────────
describe('getPlans — R1 consultar planes', () => {
  const plans: Plan[] = [
    {
      code: 'ACC_ESENCIAL',
      name: 'Accidente Esencial',
      premium: 50000,
      availableQuota: 1,
    },
    {
      code: 'ACC_PLUS',
      name: 'Accidente Plus',
      premium: 90000,
      availableQuota: 5,
    },
  ]

  it('devuelve la lista de planes en un 200', async () => {
    const fetchMock = mockFetchOnce({ status: 200, json: plans })

    const result = await getPlans()

    expect(result).toEqual(plans)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/plans')
    // GET: no se envía method explícito
    expect((init as RequestInit).method).toBeUndefined()
  })

  it('no envía el header X-Advisor-Id (endpoint público)', async () => {
    const fetchMock = mockFetchOnce({ status: 200, json: plans })

    await getPlans()

    const headers = headersFromCall(fetchMock)
    expect(headers['X-Advisor-Id']).toBeUndefined()
    expect(headers['Content-Type']).toBe('application/json')
  })
})

// ─────────────────────── R2 / R3 — POST /api/sales ──────────────────────────
describe('createSale — R2/R3 registrar venta', () => {
  const sale: Sale = {
    id: 'a3f1-guid',
    requestReference: 'REF-A-0001',
    advisorId: 'A',
    planCode: 'ACC_ESENCIAL',
    planName: 'Accidente Esencial',
    buyerName: 'Juan Perez',
    buyerEmail: 'juan@ejemplo.test',
    premium: 50000,
    acceptedAt: '2026-10-08T21:30:00+00:00',
  }

  const body = {
    planCode: 'ACC_ESENCIAL',
    buyerName: 'Juan Perez',
    buyerEmail: 'juan@ejemplo.test',
    requestReference: 'REF-A-0001',
  }

  it('envía POST con header de asesor y cuerpo JSON, y devuelve la venta (201)', async () => {
    const fetchMock = mockFetchOnce({ status: 201, json: sale })

    const result = await createSale('A', body)

    expect(result).toEqual(sale)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/sales')
    expect(init.method).toBe('POST')
    expect(JSON.parse(init.body as string)).toEqual(body)
    expect((init.headers as Record<string, string>)['X-Advisor-Id']).toBe('A')
  })

  it('R3 repetición: misma referencia y datos devuelve la misma venta', async () => {
    mockFetchOnce({ status: 200, json: sale })
    const first = await createSale('A', body)

    mockFetchOnce({ status: 200, json: sale })
    const second = await createSale('A', body)

    expect(second.id).toBe(first.id)
    expect(second.premium).toBe(first.premium)
  })

  it('R3 conflicto de referencia: 409 REFERENCE_CONFLICT', async () => {
    mockFetchOnce({
      status: 409,
      json: { error: { code: 'REFERENCE_CONFLICT', message: '...' } },
    })

    const err = await createSale('A', body).catch((e) => e)
    expect(err).toBeInstanceOf(ApiError)
    expect((err as ApiError).code).toBe('REFERENCE_CONFLICT')
    expect((err as ApiError).status).toBe(409)
    expect((err as ApiError).message).toContain('Se conserva la venta original')
  })

  it('sin cupos: 409 NO_QUOTA_AVAILABLE', async () => {
    mockFetchOnce({
      status: 409,
      json: { error: { code: 'NO_QUOTA_AVAILABLE', message: '...' } },
    })

    const err = (await createSale('A', body).catch((e) => e)) as ApiError
    expect(err.code).toBe('NO_QUOTA_AVAILABLE')
    expect(err.message).toContain('No quedan cupos')
  })

  it('datos inválidos: 400 INVALID_SALE_DATA', async () => {
    mockFetchOnce({
      status: 400,
      json: { error: { code: 'INVALID_SALE_DATA', message: '...' } },
    })

    const err = (await createSale('A', body).catch((e) => e)) as ApiError
    expect(err.code).toBe('INVALID_SALE_DATA')
    expect(err.status).toBe(400)
  })

  it('plan inexistente: 404 PLAN_NOT_FOUND', async () => {
    mockFetchOnce({
      status: 404,
      json: { error: { code: 'PLAN_NOT_FOUND', message: '...' } },
    })

    const err = (await createSale('A', body).catch((e) => e)) as ApiError
    expect(err.code).toBe('PLAN_NOT_FOUND')
    expect(err.status).toBe(404)
  })

  it('concurrencia no resuelta: 409 CONCURRENCY_CONFLICT', async () => {
    mockFetchOnce({
      status: 409,
      json: { error: { code: 'CONCURRENCY_CONFLICT', message: '...' } },
    })

    const err = (await createSale('A', body).catch((e) => e)) as ApiError
    expect(err.code).toBe('CONCURRENCY_CONFLICT')
  })

  it('401 sin cuerpo se mapea a UNAUTHORIZED_ADVISOR', async () => {
    mockFetchOnce({ status: 401, noBody: true })

    const err = (await createSale('A', body).catch((e) => e)) as ApiError
    expect(err.code).toBe('UNAUTHORIZED_ADVISOR')
    expect(err.status).toBe(401)
  })

  it('error de red se propaga', async () => {
    mockFetchReject(new TypeError('Failed to fetch'))

    await expect(createSale('A', body)).rejects.toThrow('Failed to fetch')
  })
})

// ─────────────────────────── R4 — GET /api/sales ────────────────────────────
describe('getSales — R4 consultar ventas propias', () => {
  const pageData: SalesPage = {
    items: [
      {
        id: 'a3f1-guid',
        requestReference: 'REF-A-0001',
        planName: 'Accidente Esencial',
        premium: 50000,
        buyerName: 'Juan Perez',
        acceptedAt: '2026-10-08T21:30:00+00:00',
      },
    ],
    page: 1,
    pageSize: 20,
    totalCount: 1,
    totalPages: 1,
  }

  it('construye la query con page y pageSize por defecto (20)', async () => {
    const fetchMock = mockFetchOnce({ status: 200, json: pageData })

    const result = await getSales('A', 1)

    expect(result).toEqual(pageData)
    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toBe('/api/sales?page=1&pageSize=20')
  })

  it('respeta un pageSize personalizado y la página solicitada', async () => {
    const fetchMock = mockFetchOnce({ status: 200, json: pageData })

    await getSales('B', 3, 10)

    const url = fetchMock.mock.calls[0][0] as string
    expect(url).toBe('/api/sales?page=3&pageSize=10')
  })

  it('envía el header del asesor activo (aislamiento por asesor)', async () => {
    const fetchMock = mockFetchOnce({ status: 200, json: pageData })

    await getSales('B', 1)

    expect(headersFromCall(fetchMock)['X-Advisor-Id']).toBe('B')
  })

  it('asesor inválido: 401 UNAUTHORIZED_ADVISOR', async () => {
    mockFetchOnce({
      status: 401,
      json: { error: { code: 'UNAUTHORIZED_ADVISOR', message: '...' } },
    })

    const err = (await getSales('A', 1).catch((e) => e)) as ApiError
    expect(err.code).toBe('UNAUTHORIZED_ADVISOR')
    expect(err.status).toBe(401)
  })
})
