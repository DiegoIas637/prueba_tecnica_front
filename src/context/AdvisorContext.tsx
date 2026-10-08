import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { AdvisorId } from '../api/types'

interface AdvisorContextValue {
  advisorId: AdvisorId
  setAdvisorId: (id: AdvisorId) => void
}

const AdvisorContext = createContext<AdvisorContextValue | null>(null)

const STORAGE_KEY = 'segura-vida.advisor'

export function AdvisorProvider({ children }: { children: ReactNode }) {
  const [advisorId, setAdvisorIdState] = useState<AdvisorId>(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored === 'B' ? 'B' : 'A'
  })

  const value = useMemo<AdvisorContextValue>(
    () => ({
      advisorId,
      setAdvisorId: (id) => {
        localStorage.setItem(STORAGE_KEY, id)
        setAdvisorIdState(id)
      },
    }),
    [advisorId],
  )

  return (
    <AdvisorContext.Provider value={value}>{children}</AdvisorContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAdvisor(): AdvisorContextValue {
  const ctx = useContext(AdvisorContext)
  if (!ctx) throw new Error('useAdvisor debe usarse dentro de AdvisorProvider')
  return ctx
}
