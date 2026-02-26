'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

export type Period = 'last-week' | 'last-month' | 'all-time'

const STORAGE_KEY = 'centy-dl-period'

function isPeriod(value: string): value is Period {
  return value === 'last-week' || value === 'last-month' || value === 'all-time'
}

interface PeriodContextValue {
  period: Period
  setPeriod: (p: Period) => void
}

const PeriodContext = createContext<PeriodContextValue>({
  period: 'last-month',
  setPeriod: () => {},
})

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [period, setPeriodState] = useState<Period>('last-month')

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored !== null && isPeriod(stored)) {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPeriodState(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  function setPeriod(p: Period) {
    setPeriodState(p)
    try {
      localStorage.setItem(STORAGE_KEY, p)
    } catch {
      // ignore
    }
  }

  return (
    <PeriodContext.Provider value={{ period, setPeriod }}>
      {children}
    </PeriodContext.Provider>
  )
}

export function usePeriod() {
  return useContext(PeriodContext)
}
