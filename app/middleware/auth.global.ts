import { useAuth } from '~/composables/useAuth'

export default defineNuxtRouteMiddleware((to) => {
  const { state } = useAuth()

  const publicPaths = ['/auth/sign-in', '/auth/forgot-password', '/auth/reset-password']

  if (publicPaths.includes(to.path)) return

  if (!state.token) {
    return navigateTo({ path: '/auth/sign-in', query: { redirect: to.fullPath } })
  }
})
