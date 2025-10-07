import React, { useState, useEffect } from 'react';

interface VolumeSliderProps {
    uploadedId: number;
    initialVolume?: number;
    onVolumeChange?: (volume: number) => void;
    className?: string;
}

const VolumeSlider: React.FC<VolumeSliderProps> = ({
    uploadedId,
    initialVolume = 1.0,
    onVolumeChange,
    className = '',
}) => {
    const [volume, setVolume] = useState(initialVolume);
    const [isChanging, setIsChanging] = useState(false);

    useEffect(() => {
        setVolume(initialVolume);
    }, [initialVolume]);

    const handleVolumeChange = async (newVolume: number) => {
        setVolume(newVolume);
        setIsChanging(true);

        try {
            const response = await fetch(`http://localhost:5000/api/button-volume/${uploadedId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ volume: newVolume }),
            });

            const data = await response.json();

            if (data.success && onVolumeChange) {
                onVolumeChange(newVolume);
            }
        } catch (err) {
            console.error('Error updating volume:', err);
        } finally {
            setIsChanging(false);
        }
    };

    const getVolumeIcon = () => {
        if (volume === 0) {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.375-3.5A1 1 0 014 13h-.5A1.5 1.5 0 012 11.5v-3A1.5 1.5 0 013.5 7H4a1 1 0 01.008-.224l4.375-3.5zM16.707 9.293a1 1 0 010 1.414l-1.414 1.414a1 1 0 01-1.414-1.414L14.586 10l-.707-.707a1 1 0 011.414-1.414l1.414 1.414z" clipRule="evenodd" />
                </svg>
            );
        } else if (volume < 0.5) {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.375-3.5A1 1 0 014 13h-.5A1.5 1.5 0 012 11.5v-3A1.5 1.5 0 013.5 7H4a1 1 0 01.008-.224l4.375-3.5z" clipRule="evenodd" />
                </svg>
            );
        } else {
            return (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.375-3.5A1 1 0 014 13h-.5A1.5 1.5 0 012 11.5v-3A1.5 1.5 0 013.5 7H4a1 1 0 01.008-.224l4.375-3.5zM15.95 7.05a.75.75 0 00-1.06 1.06 2.5 2.5 0 010 3.54.75.75 0 001.06 1.06 4 4 0 000-5.66z" clipRule="evenodd" />
                </svg>
            );
        }
    };

    return (
        <div
            className={`flex items-center gap-1.5 ${className}`}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.stopPropagation()}
        >
            <div className="text-white/80 flex-shrink-0">
                {getVolumeIcon()}
            </div>
            <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                className="range range-xs range-primary flex-1 min-w-0"
                disabled={isChanging}
            />
            <span className="text-xs text-white/80 w-8 text-right flex-shrink-0">
                {Math.round(volume * 100)}%
            </span>
        </div>
    );
};

export default VolumeSlider;