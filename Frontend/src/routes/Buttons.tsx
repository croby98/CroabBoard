import { createFileRoute } from '@tanstack/react-router'
import Buttons from "@/components/Buttons.tsx";

export const Route = createFileRoute('/Buttons')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>
    <Buttons />
  </div>
}
