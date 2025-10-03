import React from 'react';
import Card, { CardContent } from './Card';
import Button from './Button';

interface AudioPlayerProps {
    audioRef: React.RefObject<HTMLAudioElement | null>;
    isPlaying: boolean;
    currentTrack: string | null;
    volume: number;
    onPlayPause: () => void;
    onStop: () => void;
    onVolumeChange: (volume: number) => void;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({
    audioRef,
    isPlaying,
    currentTrack,
    volume,
    onPlayPause,
    onStop,
    onVolumeChange,
}) => {
    return (
        <Card className="w-full max-w-2xl mx-auto" shadow="xl">
            <audio 
                hidden
                ref={audioRef} 
                onPlay={() => {}} // Handled by parent
                onPause={() => {}} // Handled by parent
                onEnded={() => {}} // Handled by parent
            />
            
            <CardContent>
                {/* Player Header */}
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full transition-colors ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <div>
                            <h3 className="font-medium text-gray-900 dark:text-white">Audio Player</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                {currentTrack || 'No track loaded'}
                            </p>
                        </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex items-center gap-2">
                        <Button
                            variant={isPlaying ? 'secondary' : 'primary'}
                            size="sm"
                            onClick={onPlayPause}
                            className="w-10 h-10 rounded-full p-0"
                        >
                            {isPlaying ? (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            ) : (
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                            )}
                        </Button>
                        
                        <Button
                            variant="danger"
                            size="sm"
                            onClick={onStop}
                            className="w-10 h-10 rounded-full p-0"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                            </svg>
                        </Button>
                    </div>
                </div>
                
                {/* Volume Control */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Volume
                        </label>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                            {Math.round(volume * 100)}%
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.375-3.5A1 1 0 014 13h-.5A1.5 1.5 0 012 11.5v-3A1.5 1.5 0 013.5 7H4a1 1 0 01.008-.224l4.375-3.5z" clipRule="evenodd" />
                        </svg>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={volume}
                            onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                            className="flex-1 h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                        />
                        <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M10 3.5a.5.5 0 00-.851-.35l-3.633 3.636a.5.5 0 00-.146.351v5.626c0 .132.052.259.146.351l3.633 3.636a.5.5 0 00.851-.35V3.5zM15.95 7.05a.75.75 0 00-1.06 1.06 2.5 2.5 0 010 3.54.75.75 0 001.06 1.06 4 4 0 000-5.66z"/>
                        </svg>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

export default AudioPlayer;
