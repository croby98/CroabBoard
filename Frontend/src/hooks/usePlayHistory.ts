import { useCallback } from 'react';

export const usePlayHistory = () => {
    const recordPlay = useCallback(async (uploadedId: number) => {
        try {
            await fetch(`http://localhost:5000/api/play/${uploadedId}`, {
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