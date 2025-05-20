import { Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools';
import ProtectedRoute from '@/components/ProtectedRoute';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';

export const Route = createRootRoute({
    component: () => {
        return (
            <ProtectedRoute>
                <AppLayout />
            </ProtectedRoute>
        );
    },
});

function AppLayout() {
    const { isAuthenticated } = useAuth();

    return (
        <>
            <header className="bg-gray-950 text-white p-4 flex items-center justify-center">
                <a href="/home" className="text-2xl font-bold">CrobBoard</a>
                {isAuthenticated && <Navbar />} {/* Show navbar only if authenticated */}
            </header>
            <main className="flex flex-col">
                <Outlet />
            </main>
            <TanStackRouterDevtools />
        </>
    );
}
