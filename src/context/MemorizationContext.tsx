import React, { createContext, useContext } from 'react';
import { useMemorization } from '../hooks/useMemorization';

type MemorizationContextValue = ReturnType<typeof useMemorization>;

const MemorizationContext = createContext<MemorizationContextValue | null>(null);

export function MemorizationProvider({ children }: { children: React.ReactNode }) {
  const value = useMemorization();
  return (
    <MemorizationContext.Provider value={value}>
      {children}
    </MemorizationContext.Provider>
  );
}

export function useMemorizationContext(): MemorizationContextValue {
  const ctx = useContext(MemorizationContext);
  if (!ctx) throw new Error('useMemorizationContext must be used inside MemorizationProvider');
  return ctx;
}
