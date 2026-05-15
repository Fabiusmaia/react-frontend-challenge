import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  email: string
  name: string
}

interface AuthState {
  token: string | null
  user: User | null
  isAuthenticated: boolean
  login: (email: string, password: string) => void
  logout: () => void
}

function generateToken(email: string): string {
  const payload = btoa(JSON.stringify({ email, iat: Date.now() }))
  return `cinedash_${payload}`
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,

      login: (email: string, _password: string) => {
        const token = generateToken(email)
        const name = email.split('@')[0]
        set({ token, user: { email, name }, isAuthenticated: true })
      },

      logout: () => {
        set({ token: null, user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'cinedash-auth',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
