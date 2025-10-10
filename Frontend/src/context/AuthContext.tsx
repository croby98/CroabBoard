import React, { createContext, useContext, useEffect, useState } from 'react';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
'/api'; 

interface User {
    id: number;
    username: string;
    btnSize: number;
    isAdmin: number; // 0 = user, 1 = light_admin, 2 = super_admin
    avatar: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    isAuthenticated: boolean;
    isAdmin: boolean; // true if any admin role (1 or 2)
    isSuperAdmin: boolean; // true only if super_admin (2)
    isLightAdmin: boolean; // true only if light_admin (1)
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    updateAvatar: (avatar: string | null) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const API_URL = `http://${API_BASE_URL}:5000/api`;

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const login = async (username: string, password: string): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Important for session cookies
                body: JSON.stringify({ username, password }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.message || 'Login failed');
            }

            const data = await response.json();
            if (data.success) {
                setUser(data.user);
            } else {
                throw new Error(data.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const logout = async (): Promise<void> => {
        try {
            const response = await fetch(`${API_URL}/logout`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setUser(null);
            }
        } catch (error) {
            console.error('Logout error:', error);
            throw error;
        }
    };

    const updateAvatar = (avatar: string | null) => {
        if (user) {
            setUser({ ...user, avatar });
        }
    };

    // Check if user is already logged in on app start
    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch(`${API_URL}/me`, {
                    credentials: 'include',
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        setUser(data.user);
                    }
                } else if (response.status === 401) {
                    // User not authenticated - this is normal, no need to log
                    setUser(null);
                } else {
                    // Other error
                    console.log('Auth check failed:', response.status);
                }
            } catch (error) {
                // Network error or other issues
                console.log('Auth check error:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuthStatus();
    }, []);

    return (
        <AuthContext.Provider value={{
            user,
            loading,
            isAuthenticated: !!user,
            isAdmin: (user?.isAdmin === 1 || user?.isAdmin === 2) || false,
            isSuperAdmin: user?.isAdmin === 2 || false,
            isLightAdmin: user?.isAdmin === 1 || false,
            login,
            logout,
            updateAvatar
        }}>
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
