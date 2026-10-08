import { vi } from 'vitest'

export interface MockResponseInit {
  status?: number
  /** Cuerpo JSON a devolver. Si es undefined, no habrá body parseable. */
  json?: unknown
  /** Fuerza que res.json() falle (p. ej. respuesta sin cuerpo). */
  noBody?: boolean
}

/**
 * Instala un mock de global.fetch que devuelve la respuesta indicada y
 * registra las llamadas para poder inspeccionar URL, método y headers.
 */
export function mockFetchOnce(init: MockResponseInit) {
  const { status = 200, json, noBody = false } = init
  const ok = status >= 200 && status < 300

  const response = {
    ok,
    status,
    json: async () => {
      if (noBody) throw new SyntaxError('Unexpected end of JSON input')
      return json
    },
  } as unknown as Response

  const fetchMock = vi.fn().mockResolvedValue(response)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Mock que rechaza, simulando un fallo de red. */
export function mockFetchReject(error: Error) {
  const fetchMock = vi.fn().mockRejectedValue(error)
  vi.stubGlobal('fetch', fetchMock)
  return fetchMock
}

/** Lee los headers pasados a la llamada n (0-indexed) del mock. */
export function headersFromCall(
  fetchMock: ReturnType<typeof vi.fn>,
  call = 0,
): Record<string, string> {
  const init = fetchMock.mock.calls[call]?.[1] as RequestInit | undefined
  return (init?.headers ?? {}) as Record<string, string>
}
