import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/_disabled/')({
  beforeLoad: () => {
    throw redirect({ to: '/sign-in' })
  },
})
