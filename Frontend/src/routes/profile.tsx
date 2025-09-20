import { createFileRoute } from '@tanstack/react-router'
import ProfilePage from '@/components/ProfilePage'

export const Route = createFileRoute('/profile')({
  component: RouteComponent,
})

function RouteComponent() {
  return <ProfilePage />
}