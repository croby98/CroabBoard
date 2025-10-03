import { useState, useEffect, useCallback } from 'react';

interface HistoryEntry {
    id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    imageUrl: string;
    soundUrl: string;
    category_name?: string;
    category_color?: string;
    played_at: string;
}

interface RecentlyPlayed extends Omit<HistoryEntry, 'played_at'> {
    last_played: string;
}

export const usePlayHistory = () => {
    const [history, setHistory] = useState<HistoryEntry[]>([]);
    const [recentlyPlayed, setRecentlyPlayed] = useState<RecentlyPlayed[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchHistory = useCallback(async (limit: number = 50) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(`http://localhost:5000/api/history?limit=${limit}`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                setHistory(data.history);
            } else {
                setError(data.message || 'Failed to fetch history');
            }
        } catch (err: any) {
            setError(err.message || 'Failed to fetch history');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRecentlyPlayed = useCallback(async (limit: number = 10) => {
        try {
            const response = await fetch(`http://localhost:5000/api/recently-played?limit=${limit}`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                setRecentlyPlayed(data.recentlyPlayed);
            }
        } catch (err) {
            console.error('Error fetching recently played:', err);
        }
    }, []);

    const recordPlay = useCallback(async (uploadedId: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/play/${uploadedId}`, {
                method: 'POST',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                // Refresh history and recently played
                await Promise.all([
                    fetchHistory(),
                    fetchRecentlyPlayed()
                ]);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error recording play:', err);
            return false;
        }
    }, [fetchHistory, fetchRecentlyPlayed]);

    const clearHistory = useCallback(async () => {
        try {
            const response = await fetch('http://localhost:5000/api/history', {
                method: 'DELETE',
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                setHistory([]);
                setRecentlyPlayed([]);
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error clearing history:', err);
            return false;
        }
    }, []);

    useEffect(() => {
        fetchHistory();
        fetchRecentlyPlayed();
    }, [fetchHistory, fetchRecentlyPlayed]);

    return {
        history,
        recentlyPlayed,
        loading,
        error,
        fetchHistory,
        fetchRecentlyPlayed,
        recordPlay,
        clearHistory,
    };
};
