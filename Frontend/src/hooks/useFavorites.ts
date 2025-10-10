import { useState, useEffect, useCallback } from 'react';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
'/api'; 

interface FavoriteButton {
    uploaded_id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    imageUrl: string;
    soundUrl: string;
    category_name?: string;
    category_color?: string;
    favorited_at: string;
}

export const useFavorites = () => {
    const [favorites, setFavorites] = useState<FavoriteButton[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchFavorites = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://${API_BASE_URL}:5000/api/favorites`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                setFavorites(data.favorites);
            } else {
                setError(data.message || 'Failed to fetch favorites');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch favorites');
        } finally {
            setLoading(false);
        }
    }, []);

    const isFavorite = useCallback((uploadedId: number): boolean => {
        // Check if the uploadedId exists in the favorites array
        return favorites.some(fav => fav.uploaded_id === uploadedId);
    }, [favorites]);

    const addFavorite = useCallback(async (uploadedId: number) => {
        try {
            const response = await fetch(`http://${API_BASE_URL}:5000/api/favorite/${uploadedId}`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                await fetchFavorites();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error adding favorite:', err);
            return false;
        }
    }, [fetchFavorites]);

    const removeFavorite = useCallback(async (uploadedId: number) => {
        try {
            const response = await fetch(`http://${API_BASE_URL}:5000/api/favorite/${uploadedId}`, {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                await fetchFavorites();
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error removing favorite:', err);
            return false;
        }
    }, [fetchFavorites]);

    const toggleFavorite = useCallback(async (uploadedId: number) => {
        try {
            const response = await fetch(`http://${API_BASE_URL}:5000/api/favorite/${uploadedId}/toggle`, {
                method: 'PUT',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                await fetchFavorites();
                return data.isFavorite;
            }
            return null;
        } catch (err) {
            console.error('Error toggling favorite:', err);
            return null;
        }
    }, [fetchFavorites]);

    useEffect(() => {
        fetchFavorites();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Only fetch once on mount

    return {
        favorites,
        loading,
        error,
        fetchFavorites,
        isFavorite,
        addFavorite,
        removeFavorite,
        toggleFavorite,
    };
};
