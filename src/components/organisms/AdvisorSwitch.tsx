import { motion } from 'framer-motion'
import { UserRound } from 'lucide-react'
import type { AdvisorId } from '../../api/types'
import { useAdvisor } from '../../context/AdvisorContext'

const ADVISORS: AdvisorId[] = ['A', 'B']

export function AdvisorSwitch() {
  const { advisorId, setAdvisorId } = useAdvisor()

  return (
    <div className="flex items-center gap-3">
      <span className="hidden items-center gap-1.5 text-sm text-slate-500 sm:flex">
        <UserRound className="size-4" />
        Asesor activo
      </span>
      <div className="relative flex rounded-full border border-violet-100 bg-white/70 p-1 shadow-sm shadow-violet-200/40">
        {ADVISORS.map((id) => {
          const active = id === advisorId
          return (
            <button
              key={id}
              type="button"
              onClick={() => setAdvisorId(id)}
              className={`relative z-10 w-11 rounded-full py-1.5 text-sm font-semibold transition-colors ${
                active ? 'text-white' : 'text-slate-500 hover:text-slate-700'
              }`}
              aria-pressed={active}
            >
              {active && (
                <motion.span
                  layoutId="advisor-pill"
                  className="absolute inset-0 -z-10 rounded-full bg-gradient-to-r from-brand-400 to-brand-500 shadow-md shadow-brand-300/50"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              {id}
            </button>
          )
        })}
      </div>
    </div>
  )
}
