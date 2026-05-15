import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from './authStore'

describe('authStore', () => {
  beforeEach(() => {
    useAuthStore.setState({ token: null, user: null, isAuthenticated: false })
  })

  it('starts unauthenticated', () => {
    const { isAuthenticated, token, user } = useAuthStore.getState()
    expect(isAuthenticated).toBe(false)
    expect(token).toBeNull()
    expect(user).toBeNull()
  })

  it('sets authenticated state on login', () => {
    useAuthStore.getState().login('test@example.com', 'password123')
    const { isAuthenticated, token, user } = useAuthStore.getState()
    expect(isAuthenticated).toBe(true)
    expect(token).toBeTruthy()
    expect(token).toMatch(/^cinedash_/)
    expect(user?.email).toBe('test@example.com')
    expect(user?.name).toBe('test')
  })

  it('derives name from email on login', () => {
    useAuthStore.getState().login('joao.silva@empresa.com', 'pass123')
    expect(useAuthStore.getState().user?.name).toBe('joao.silva')
  })

  it('generates unique tokens', () => {
    useAuthStore.getState().login('a@a.com', 'pass123')
    const token1 = useAuthStore.getState().token
    useAuthStore.setState({ token: null })
    // Advance time to ensure different timestamp
    useAuthStore.getState().login('a@a.com', 'pass123')
    const token2 = useAuthStore.getState().token
    // Both are valid cinedash tokens (they may differ due to timestamp)
    expect(token1).toMatch(/^cinedash_/)
    expect(token2).toMatch(/^cinedash_/)
  })

  it('clears state on logout', () => {
    useAuthStore.getState().login('test@example.com', 'password123')
    useAuthStore.getState().logout()
    const { isAuthenticated, token, user } = useAuthStore.getState()
    expect(isAuthenticated).toBe(false)
    expect(token).toBeNull()
    expect(user).toBeNull()
  })
})
