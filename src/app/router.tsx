import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router'
import { LoginPage } from '@/pages/LoginPage'
import { HomePage } from '@/pages/HomePage'
import { WatchlistPage } from '@/pages/WatchlistPage'
import { MoviePage } from '@/pages/MoviePage'
import { useAuthStore } from '@/features/auth/store/authStore'

function getAuth() {
  return useAuthStore.getState().isAuthenticated
}

const rootRoute = createRootRoute({
  component: Outlet,
})

const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    if (getAuth()) {
      throw redirect({ to: '/' })
    }
  },
  component: LoginPage,
})

const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    if (!getAuth()) {
      throw redirect({ to: '/login' })
    }
  },
  component: HomePage,
})

const watchlistRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/watchlist',
  beforeLoad: () => {
    if (!getAuth()) {
      throw redirect({ to: '/login' })
    }
  },
  component: WatchlistPage,
})

const movieRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/movie/$id',
  beforeLoad: () => {
    if (!getAuth()) {
      throw redirect({ to: '/login' })
    }
  },
  component: MoviePage,
})

const routeTree = rootRoute.addChildren([loginRoute, homeRoute, watchlistRoute, movieRoute])

export const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}
