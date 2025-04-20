import { createFileRoute } from '@tanstack/react-router';
// @ts-ignore
import SearchButtons from '@/components/SearchButtons.tsx';

export const Route = createFileRoute('/search')({
    component: SearchButtons, // Attach the SearchButtons component to this route
});