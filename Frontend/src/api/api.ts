const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
'/api'; 

// Helper function to get authenticated headers
const getAuthHeaders = async (token: string | null) => {
    const headers: HeadersInit = {
        'Content-Type': 'application/json'
    };
    
    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }
    
    return headers;
};

// Generic API request helper
export const apiRequest = async (
    endpoint: string, 
    options: RequestInit = {}, 
    token: string | null = null
) => {
    const headers = await getAuthHeaders(token);
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
            ...headers,
            ...(options.headers || {})
        }
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Network error' }));
        throw new Error(errorData.message || `HTTP ${response.status}`);
    }

    return response.json();
};

// Specific API functions
export const searchButtonsByCategory = async (category: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/search?category=${encodeURIComponent(category)}`, {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: 'Network error' }));
            throw new Error(errorData.message || `HTTP ${response.status}`);
        }

        return response.json();
    } catch (error) {
        console.error('Error fetching category data:', error);
        throw error;
    }
};

export const getCurrentUser = async (token: string | null) => {
    return await apiRequest('/me', { method: 'GET' }, token);
};

export const getUserButtons = async (token: string | null) => {
    return await apiRequest('/index', { method: 'GET' }, token);
};

export const getUserProfile = async (token: string | null) => {
    return await apiRequest('/profil', { method: 'GET' }, token);
};
