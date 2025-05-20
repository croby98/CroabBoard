import { createFileRoute } from '@tanstack/react-router'
import HomeButtons from "@/components/HomeButtons";

export const Route = createFileRoute('/home')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <HomeButtons />
  </div>
}
