import { useState, useEffect, useCallback } from 'react';

interface VolumeMap {
    [uploadedId: number]: number;
}

export const useButtonVolume = () => {
    const [volumes, setVolumes] = useState<VolumeMap>({});
    const [loading, setLoading] = useState(false);

    const fetchVolumes = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/button-volumes', {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                setVolumes(data.volumes);
            }
        } catch (err) {
            console.error('Error fetching volumes:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const getVolume = useCallback((uploadedId: number): number => {
        return volumes[uploadedId] ?? 1.0; // Default to 1.0 (100%)
    }, [volumes]);

    const setVolume = useCallback(async (uploadedId: number, volume: number) => {
        // Validate volume
        const clampedVolume = Math.max(0, Math.min(1, volume));

        try {
            const response = await fetch(`http://localhost:5000/api/button-volume/${uploadedId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ volume: clampedVolume }),
            });
            const data = await response.json();

            if (data.success) {
                // Update local state
                setVolumes(prev => ({
                    ...prev,
                    [uploadedId]: clampedVolume,
                }));
                return true;
            }
            return false;
        } catch (err) {
            console.error('Error setting volume:', err);
            return false;
        }
    }, []);

    useEffect(() => {
        fetchVolumes();
    }, [fetchVolumes]);

    return {
        volumes,
        loading,
        getVolume,
        setVolume,
        fetchVolumes,
    };
};
