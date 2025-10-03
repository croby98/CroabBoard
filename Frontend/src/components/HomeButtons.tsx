import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface Button {
    image_id: number;
    uploaded_id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    category_color: string;
}

const apiUrlImagesFiles = 'http://localhost:5000/uploads/images/';
const apiUrlSoundFiles = 'http://localhost:5000/uploads/audio/';

let playCount = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

const HomeButtons: React.FC = () => {
    const { user } = useAuth();
    const [buttons, setButtons] = useState<Button[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [volume, setVolume] = useState(0.5);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        imageId: number | null;
        soundFilename: string | null;
    } | null>(null);


    const fetchUserButtons = async () => {
        setLoading(true);
        setErrorMessage('');        
        try {
            const response = await fetch('http://localhost:5000/api/linked', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
                        
            if (response.ok && data.success) {
                
                // Transform the data to match the expected format
                const transformedButtons = data.linked.map((button: any) => ({
                    image_id: button.image_id,
                    uploaded_id: button.uploaded_id,
                    button_name: button.button_name || 'Untitled',
                    image_filename: button.image_filename,
                    sound_filename: button.sound_filename,
                    category_color: button.category_color || '#3B82F6'
                }));
                
                
                setButtons(transformedButtons);
                
                // Get user button size from /api/me endpoint
                const userResponse = await fetch('http://localhost:5000/api/me', {
                    credentials: 'include'
                });
                const userData = await userResponse.json();
                if (userData.success) {
                    // User button size preference would go here if needed
                }
            } else {
                console.error('Failed to fetch buttons:', data.message);
                setErrorMessage(data.message || 'Failed to fetch user buttons');
            }
        } catch (error: any) {
            console.error('Error fetching buttons:', error);
            setErrorMessage(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const PlaySound = (sound_filename?: string | null, imageId?: number) => {
        if (!sound_filename) {
            return;
        }
        
        const soundUrl = `${apiUrlSoundFiles}${sound_filename}`;
        
        // Find button name for display
        const button = buttons.find(b => b.image_id === imageId);
        const trackName = button ? button.button_name : sound_filename;
        
        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.volume = volume;
            audioRef.current.currentTime = 0;
            
            setCurrentTrack(trackName);
            
            audioRef.current.play().catch(error => {
                console.error('Error playing sound:', error);
                setErrorMessage('Error playing audio. Please try again.');
                setIsPlaying(false);
            });
        } else {
            console.error('Audio ref not available');
        }
    };


    useEffect(() => {
        fetchUserButtons();
    }, []);

    // Audio control functions
    const handlePlayPause = () => {
        if (!audioRef.current) {
            return;
        }
        
        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTrack(null);
    };


    // Volume control
    const handleVolumeChange = (newVolume: number) => {
        setVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };



    // Start spamming
    const startSpammingAK47Sound = (sound_filename: string, imageId?: number) => {
          if (intervalId) clearInterval(intervalId);

          playCount = 0;
          intervalId = setInterval(() => {
               PlaySound(sound_filename, imageId);
               playCount++;
               if (playCount >= 47) {
                    if (intervalId) clearInterval(intervalId);
               }
          }, 130);
    };


    const handleContextMenu = (
        event: React.MouseEvent,
        imageId: number,
        soundFilename: string
    ) => {
        event.preventDefault();
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            imageId,
            soundFilename,
        });
    };

    const handleCloseContextMenu = () => {
        setContextMenu(null);
    };

    const handleRemove = async () => {
        if (!contextMenu?.imageId) return;
        await fetch(`http://localhost:5000/api/delete_image/${contextMenu.imageId}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        setButtons(buttons.filter(b => b.image_id !== contextMenu.imageId));
        handleCloseContextMenu();
    };

    const handleAK47 = () => {
        if (contextMenu?.soundFilename) {
            // Find the button to get its image ID for volume
            const button = buttons.find(b => b.sound_filename === contextMenu.soundFilename);
            startSpammingAK47Sound(contextMenu.soundFilename, button?.image_id);
        }
        handleCloseContextMenu();
    };

    useEffect(() => {
        const close = () => handleCloseContextMenu();
        if (contextMenu?.visible) {
            window.addEventListener('click', close);
            return () => window.removeEventListener('click', close);
        }
    }, [contextMenu]);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>, index: number) => {
        event.preventDefault();
        if (draggedIndex === null || draggedIndex === index) return;
        const updated = [...buttons];
        const [removed] = updated.splice(draggedIndex, 1);
        updated.splice(index, 0, removed);
        setButtons(updated);
        setDraggedIndex(index);
    };

    const handleDrop = async () => {
        setDraggedIndex(null);

        const positions = buttons.map((b, idx) => ({
            id: b.uploaded_id,
            new_position: idx
        }));


        try {
            const response = await fetch('http://localhost:5000/api/linked', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ positions }),
            });
            
            const result = await response.json();
            console.log('Reorder response:', result);
            
            if (!response.ok) {
                throw new Error(result.message || 'Failed to save order');
            }
        } catch (e: any) {
            console.error('Failed to update button order:', e);
            setErrorMessage('Failed to update button order: ' + e.message);
        }
    };


    return (
        <div className="min-h-screen bg-base-200 p-2">
            <div className="max-w-full space-y-4">

                {/* Compact Audio Player */}
                <div className="card bg-base-100 shadow-lg">
                    <div className="card-body p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${isPlaying ? 'bg-success animate-pulse' : 'bg-base-300'}`} />
                                <div>
                                    <h3 className="font-semibold text-sm">Audio Player</h3>
                                    <p className="text-xs opacity-60">{currentTrack || 'No track loaded'}</p>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2">
                                <div className="btn-group">
                                    <button 
                                        className={`btn btn-sm ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
                                        onClick={handlePlayPause}
                                    >
                                        {isPlaying ? '⏸️' : '▶️'}
                                    </button>
                                    <button className="btn btn-sm btn-error" onClick={handleStop}>⏹️</button>
                                </div>
                                
                                {/* Volume Control */}
                                <div className="flex items-center gap-2">
                                    <span className="text-sm">🔊</span>
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="1" 
                                        step="0.05"
                                        value={volume}
                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                        className="range range-xs w-20" 
                                    />
                                    <span className="badge badge-xs">{Math.round(volume * 100)}%</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            {/* Sound Buttons - Full Width */}
            <div className="flex-1">
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-col items-center justify-center h-64">
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="mt-4 text-base-content/60">Loading your buttons...</p>
                    </div>
                )}

                {/* Error State */}
                {errorMessage && (
                    <div className="alert alert-error shadow-lg">
                        <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                        <span>{errorMessage}</span>
                        <button 
                            onClick={() => setErrorMessage('')}
                            className="btn btn-sm btn-ghost"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Empty State */}
                {!loading && !errorMessage && buttons.length === 0 && (
                    <div className="hero min-h-64">
                        <div className="hero-content text-center">
                            <div>
                                <div className="text-9xl mb-4">🎵</div>
                                <h1 className="text-2xl font-bold">No sound buttons found</h1>
                                <p className="py-2 opacity-60">Upload some sounds to get started!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Sound Buttons - Full Page Grid */}
                <div className="flex-1">
                    {!loading && !errorMessage && buttons.length > 0 && (
                        <div className="flex flex-wrap gap-1 justify-start">
                                    {buttons.map((button, idx) => (
                                        <div
                                            key={button.image_id}
                                            className={`group relative cursor-pointer transition-all duration-200 hover:scale-105 hover:z-10 ${
                                                draggedIndex === idx ? 'opacity-50 rotate-2' : 'opacity-100'
                                            }`}
                                            draggable
                                            onDragStart={() => handleDragStart(idx)}
                                            onDragOver={(e) => handleDragOver(e, idx)}
                                            onDrop={handleDrop}
                                        >
                                            {/* Card with Category Color Border */}
                                            <div 
                                                className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 border-4"
                                                style={{ 
                                                    borderColor: button.category_color,
                                                    width: user?.btnSize || 100,
                                                    height: user?.btnSize || 100
                                                }}
                                            >
                                                <figure className="relative overflow-hidden">
                                                    <img
                                                        src={`${apiUrlImagesFiles}${button.image_filename}`}
                                                        alt={button.button_name}
                                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                        onClick={() => PlaySound(button.sound_filename, button.image_id)}
                                                        onContextMenu={(e) => handleContextMenu(e, button.image_id, button.sound_filename)}
                                                        loading="lazy"
                                                    />
                                                    
                                                    {/* Play Overlay */}
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                                    
                                                    {/* Button Name Overlay */}
                                                    <div className="absolute bottom-0 left-0 right-0 p-1 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                                                        <p className="text-white font-semibold text-xs truncate drop-shadow-lg text-center">
                                                            {button.button_name}
                                                        </p>
                                                    </div>
                                                    
                                                    {/* Category Color Dot */}
                                                    <div 
                                                        className="absolute top-1 right-1 w-3 h-3 rounded-full shadow-lg ring-2 ring-white/30"
                                                        style={{ backgroundColor: button.category_color }}
                                                    />
                                                </figure>
                                            </div>
                                        </div>
                                    ))}
                        </div>
                    )}
                </div>

            {/* Context Menu */}
            {contextMenu?.visible && (
                <div className="fixed inset-0 z-50" onClick={handleCloseContextMenu}>
                    <div
                        className="absolute bg-base-100 shadow-2xl rounded-box border border-base-300"
                        style={{
                            top: contextMenu.y,
                            left: contextMenu.x,
                        }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <ul className="menu menu-compact w-48">
                            <li>
                                <a onClick={handleRemove} className="text-error">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Remove Button
                                </a>
                            </li>
                            <li>
                                <a onClick={handleAK47} className="text-warning">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                    </svg>
                                    AK47 Spam Mode
                                </a>
                            </li>
                        </ul>
                    </div>
                </div>
            )}


            {/* Hidden Audio Element */}
            <audio 
                ref={audioRef}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onEnded={() => {
                    setIsPlaying(false);
                    setCurrentTrack(null);
                }}
                hidden
            />
            </div>
            </div>
        </div>
    );
};

export default HomeButtons;
