import React from 'react';
import { Navigate, useLocation} from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
}

// List of public routes that don't require authentication
const PUBLIC_ROUTES = ['/', '/register'];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();
    const location = useLocation(); // Get the current location
    const currentPath = location.pathname; // Access the path

    // Wait while authentication status is being determined
    if (loading) {
        return <div>Loading...</div>; // You can replace this with a spinner or skeleton screen
    }

    // Allow access to public routes without authentication
    if (!isAuthenticated && PUBLIC_ROUTES.includes(currentPath)) {
        return <>{children}</>;
    }

    // Redirect unauthenticated users trying to access protected routes
    if (!isAuthenticated) {
        return <Navigate to="/" />;
    }

    // Render the protected content for authenticated users
    return <>{children}</>;
};

export default ProtectedRoute;