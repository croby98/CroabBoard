import React, { createContext, useContext, useEffect, useState } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    loading: boolean;
    login: () => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false); // Track login state
    const [loading, setLoading] = useState(true); // Track if we're still checking authentication

    const login = () => setIsAuthenticated(true); // Mock login
    const logout = () => setIsAuthenticated(false); // Mock logout

    useEffect(() => {
        const checkAuthStatus = async () => {
            setLoading(true); // Start loading
            try {
                const response = await fetch('http://localhost:5000/api/me', {
                    method: 'GET',
                    credentials: 'include', // Include cookies
                });

                if (response.ok) {
                    setIsAuthenticated(true); // User is logged in
                } else {
                    setIsAuthenticated(false); // User is not logged in
                }
            } catch (err) {
                console.error('Error checking authentication status:', err);
                setIsAuthenticated(false);
            } finally {
                setLoading(false); // Stop loading
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{ isAuthenticated, loading, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the authentication context
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};