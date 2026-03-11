"use client"

import { createContext, useContext, type ReactNode } from 'react'
import { useBranexData } from '@/hooks/use-branex-data'

type BranexContextType = ReturnType<typeof useBranexData>

const BranexContext = createContext<BranexContextType | null>(null)

export function BranexProvider({ children }: { children: ReactNode }) {
  const branexData = useBranexData()
  
  return (
    <BranexContext.Provider value={branexData}>
      {children}
    </BranexContext.Provider>
  )
}

export function useBranex() {
  const context = useContext(BranexContext)
  if (!context) {
    throw new Error('useBranex must be used within a BranexProvider')
  }
  return context
}
