import { createFileRoute } from '@tanstack/react-router'
import AdminDashboard from '@/components/AdminDashboard'

export const Route = createFileRoute('/admin')({
  component: RouteComponent,
})

function RouteComponent() {
  return <AdminDashboard />
}