import { createContext, useContext } from 'react'

export interface AuthContextValue {
  isLoading: boolean
  isError: boolean
  error: unknown
  isAuthenticated: boolean
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth должен использоваться внутри AuthProvider')
  return ctx
}
