import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { ReactNode } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '../api/client'
import * as client from '../api/client'
import type { Sale } from '../api/types'
import { useSaleForm } from './useSaleForm'

vi.mock('../api/client', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../api/client')>()
  return { ...actual, createSale: vi.fn() }
})

const createSaleMock = vi.mocked(client.createSale)

const sale: Sale = {
  id: 'guid-1',
  requestReference: 'REF-A-20261008-ABCD',
  advisorId: 'A',
  planCode: 'ACC_ESENCIAL',
  planName: 'Accidente Esencial',
  buyerName: 'Juan Perez',
  buyerEmail: 'juan@ejemplo.test',
  premium: 50000,
  acceptedAt: '2026-10-08T21:30:00+00:00',
}

function wrapper({ children }: { children: ReactNode }) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

function fillValidForm(result: { current: ReturnType<typeof useSaleForm> }) {
  act(() => {
    result.current.setPlanCode('ACC_ESENCIAL')
    result.current.setBuyerName('Juan Perez')
    result.current.setBuyerEmail('juan@ejemplo.test')
  })
}

beforeEach(() => {
  createSaleMock.mockReset()
})

afterEach(() => {
  vi.clearAllMocks()
})

describe('useSaleForm — validación', () => {
  it('no envía y marca errores si el formulario está incompleto', () => {
    const { result } = renderHook(() => useSaleForm('A'), { wrapper })

    act(() => result.current.submit())

    expect(createSaleMock).not.toHaveBeenCalled()
    expect(result.current.errors.plan).toBeTruthy()
    expect(result.current.errors.name).toBeTruthy()
    expect(result.current.errors.email).toBeTruthy()
  })

  it('rechaza un email con formato inválido', () => {
    const { result } = renderHook(() => useSaleForm('A'), { wrapper })

    act(() => {
      result.current.setPlanCode('ACC_ESENCIAL')
      result.current.setBuyerName('Juan')
      result.current.setBuyerEmail('correo-malo')
    })
    act(() => result.current.submit())

    expect(createSaleMock).not.toHaveBeenCalled()
    expect(result.current.errors.email).toBeTruthy()
  })
})

describe('useSaleForm — envío exitoso (R2)', () => {
  it('envía los datos y expone la venta aceptada', async () => {
    createSaleMock.mockResolvedValue(sale)
    const { result } = renderHook(() => useSaleForm('A'), { wrapper })
    fillValidForm(result)

    const sentReference = result.current.reference
    act(() => result.current.submit())

    await waitFor(() => expect(result.current.sale).toEqual(sale))
    expect(createSaleMock).toHaveBeenCalledWith('A', {
      planCode: 'ACC_ESENCIAL',
      buyerName: 'Juan Perez',
      buyerEmail: 'juan@ejemplo.test',
      requestReference: sentReference,
    })
  })
})

describe('useSaleForm — error y reintento (R5)', () => {
  it('expone el error de negocio al fallar', async () => {
    createSaleMock.mockRejectedValue(
      new ApiError('NO_QUOTA_AVAILABLE', 409),
    )
    const { result } = renderHook(() => useSaleForm('A'), { wrapper })
    fillValidForm(result)

    act(() => result.current.submit())

    await waitFor(() => expect(result.current.error).toBeInstanceOf(ApiError))
    expect((result.current.error as ApiError).code).toBe('NO_QUOTA_AVAILABLE')
  })

  it('reintenta conservando la MISMA referencia y datos', async () => {
    createSaleMock.mockRejectedValueOnce(
      new ApiError('CONCURRENCY_CONFLICT', 409),
    )
    const { result } = renderHook(() => useSaleForm('A'), { wrapper })
    fillValidForm(result)

    const reference = result.current.reference

    act(() => result.current.submit())
    await waitFor(() => expect(result.current.error).toBeTruthy())

    createSaleMock.mockResolvedValueOnce(sale)
    act(() => result.current.retry())
    await waitFor(() => expect(result.current.sale).toEqual(sale))

    // Ambos intentos usaron la misma referencia (R5).
    expect(createSaleMock).toHaveBeenCalledTimes(2)
    const firstRef = createSaleMock.mock.calls[0][1].requestReference
    const secondRef = createSaleMock.mock.calls[1][1].requestReference
    expect(secondRef).toBe(firstRef)
    expect(secondRef).toBe(reference)
  })
})

describe('useSaleForm — nueva venta usa referencia nueva (R5)', () => {
  it('limpia el formulario y genera una referencia distinta', async () => {
    createSaleMock.mockResolvedValue(sale)
    const { result } = renderHook(() => useSaleForm('A'), { wrapper })
    fillValidForm(result)

    const oldReference = result.current.reference
    act(() => result.current.submit())
    await waitFor(() => expect(result.current.sale).toEqual(sale))

    act(() => result.current.newSale())

    expect(result.current.sale).toBeUndefined()
    expect(result.current.buyerName).toBe('')
    expect(result.current.planCode).toBe('')
    expect(result.current.reference).not.toBe(oldReference)
    expect(result.current.reference).toMatch(/^REF-A-/)
  })
})
