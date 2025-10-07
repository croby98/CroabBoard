import { Outlet, createRootRoute } from '@tanstack/react-router';
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
            {isAuthenticated && <Navbar />} {/* Show navbar only if authenticated */}
            <main className="flex flex-col" onContextMenu={e => { e.preventDefault(); return false; }}>
                <Outlet />
            </main>
        </>
    );
}
