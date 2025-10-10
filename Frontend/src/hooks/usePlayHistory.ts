import { useCallback } from 'react';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
'/api'; 

export const usePlayHistory = () => {
    const recordPlay = useCallback(async (uploadedId: number) => {
        try {
            await fetch(`http://${API_BASE_URL}:5000/api/play/${uploadedId}`, {
                method: 'POST',
                credentials: 'include',
            });
        } catch (err: any) {
            console.error('Failed to record play:', err);
        }
    }, []);

    return {
        recordPlay,
    };
};
