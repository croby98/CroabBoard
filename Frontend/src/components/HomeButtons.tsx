import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';

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
let isAK47Active = false; // Flag to track if AK47 mode is running

const HomeButtons: React.FC = () => {
    const { user } = useAuth();
    const { toggleFavorite, isFavorite } = useFavorites();
    const [buttons, setButtons] = useState<Button[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [masterVolume, setMasterVolume] = useState(0.5);
    const [currentTrack, setCurrentTrack] = useState<string | null>(null);
    const [currentImage, setCurrentImage] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [contextMenu, setContextMenu] = useState<{
        visible: boolean;
        x: number;
        y: number;
        imageId: number | null;
        uploadedId: number | null;
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
                const transformedButtons = data.linked.map((button: any, index: number) => ({
                    image_id: button.image_id,
                    uploaded_id: button.uploaded_id,
                    button_name: button.button_name || 'Untitled',
                    image_filename: button.image_filename,
                    sound_filename: button.sound_filename,
                    category_color: button.category_color || '#3B82F6',
                    tri: button.tri // Keep track of the original tri value
                }));

                console.log('📥 Loaded buttons in order (by tri):', transformedButtons.map(b => ({ name: b.button_name, tri: b.tri, uploaded_id: b.uploaded_id })));
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

    const PlaySound = async (sound_filename?: string | null, imageId?: number, uploadedId?: number, recordInHistory = true) => {
        if (!sound_filename) {
            return;
        }

        // If user clicks a button while AK47 is active, stop AK47 mode
        if (intervalId && recordInHistory) { // recordInHistory = true means user click
            clearInterval(intervalId);
            intervalId = null;
            playCount = 0;
            isAK47Active = false;
        }

        const soundUrl = `${apiUrlSoundFiles}${sound_filename}`;

        // Find button for display
        const button = buttons.find(b => b.image_id === imageId);
        const trackName = button ? button.button_name : sound_filename;
        const buttonUploadedId = uploadedId || button?.uploaded_id;

        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.volume = masterVolume;
            audioRef.current.currentTime = 0;

            setCurrentTrack(trackName);
            setCurrentImage(button?.image_filename || null);

            audioRef.current.play()
                .then(async () => {
                    // Record play in history/stats (only for normal clicks, not AK47 spam)
                    if (recordInHistory && buttonUploadedId) {
                        try {
                            await fetch(`http://localhost:5000/api/play/${buttonUploadedId}`, {
                                method: 'POST',
                                credentials: 'include',
                            });
                        } catch (err) {
                            console.error('Error recording play:', err);
                        }
                    }
                })
                .catch(error => {
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

        // Cleanup: stop AK47 mode on unmount
        return () => {
            if (intervalId) {
                clearInterval(intervalId);
                intervalId = null;
            }
        };
    }, []);

    // Audio control functions
    const handlePlayPause = () => {
        if (!audioRef.current || !currentTrack) {
            return;
        }

        if (isPlaying) {
            audioRef.current.pause();
        } else {
            audioRef.current.play().catch(error => {
                console.error('Error playing:', error);
                setErrorMessage('Failed to play audio');
            });
        }
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setIsPlaying(false);
        setCurrentTrack(null);
        setCurrentImage(null);
    };

    const handleReplay = () => {
        if (audioRef.current && currentTrack) {
            audioRef.current.currentTime = 0;
            audioRef.current.play().catch(error => {
                console.error('Error replaying:', error);
                setErrorMessage('Failed to replay audio');
            });
        }
    };


    // Master Volume control
    const handleVolumeChange = (newVolume: number) => {
        setMasterVolume(newVolume);
        if (audioRef.current) {
            audioRef.current.volume = newVolume;
        }
    };



    // Start AK47 spam mode - plays sound 47 times in the main player
    const startSpammingAK47Sound = (sound_filename: string, imageId?: number, uploadedId?: number) => {
          // Stop any existing interval
          if (intervalId) {
               clearInterval(intervalId);
          }

          playCount = 0;
          isAK47Active = true; // Set flag to true

          // Play sound repeatedly using the main player, don't record each play
          intervalId = setInterval(() => {
               PlaySound(sound_filename, imageId, uploadedId, false); // recordInHistory = false for AK47
               playCount++;
               if (playCount >= 47) {
                    if (intervalId) {
                         clearInterval(intervalId);
                         intervalId = null;
                         isAK47Active = false; // Reset flag when done
                    }
               }
          }, 130);
    };


    const handleContextMenu = (
        event: React.MouseEvent,
        imageId: number,
        uploadedId: number,
        soundFilename: string
    ) => {
        event.preventDefault();
        setContextMenu({
            visible: true,
            x: event.clientX,
            y: event.clientY,
            imageId,
            uploadedId,
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
        if (contextMenu?.soundFilename && contextMenu?.uploadedId) {
            startSpammingAK47Sound(contextMenu.soundFilename, contextMenu.imageId || undefined, contextMenu.uploadedId);
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

        console.log('🔄 Updating button order:', positions);

        try {
            const response = await fetch('http://localhost:5000/api/linked', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ positions }),
            });

            const result = await response.json();
            console.log('✅ Reorder response:', result);

            if (!response.ok) {
                throw new Error(result.message || 'Failed to save order');
            } else {
                console.log('✅ Button order successfully saved to database');
            }
        } catch (e: any) {
            console.error('❌ Failed to update button order:', e);
            setErrorMessage('Failed to update button order: ' + e.message);
        }
    };


    return (
        <div className="min-h-screen bg-base-200 p-2">
            <div className="max-w-full space-y-4">

                {/* Modern Audio Player */}
                <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 border border-primary/10 shadow-xl">
                    <div className="card-body p-4">
                        <div className="flex items-center gap-4">
                            {/* Status Indicator & Track Info */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className="relative">
                                    {currentImage ? (
                                        <div className={`w-14 h-14 rounded-lg overflow-hidden transition-all duration-300 ${
                                            isPlaying
                                                ? 'ring-4 ring-primary/50 shadow-lg shadow-primary/30'
                                                : 'ring-2 ring-base-300'
                                        }`}>
                                            <img
                                                src={`${apiUrlImagesFiles}${currentImage}`}
                                                alt={currentTrack || 'Sound'}
                                                className={`w-full h-full object-cover transition-transform duration-300 ${
                                                    isPlaying ? 'scale-110' : 'scale-100'
                                                }`}
                                            />
                                        </div>
                                    ) : (
                                        <div className="w-14 h-14 rounded-lg bg-base-300 flex items-center justify-center">
                                            <span className="text-2xl opacity-50">🎶</span>
                                        </div>
                                    )}
                                    {isPlaying && (
                                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full animate-ping" />
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-base truncate">
                                        {currentTrack || 'No sound selected'}
                                    </h3>
                                    <p className="text-xs opacity-60">
                                        {isPlaying ? 'Now Playing' : currentTrack ? 'Ready' : 'Click a button to play'}
                                    </p>
                                </div>
                            </div>

                            {/* Player Controls */}
                            <div className="flex items-center gap-3">
                                {/* Transport Buttons */}
                                <div className="btn-group shadow-lg">
                                    <button
                                        className="btn btn-sm btn-ghost tooltip"
                                        data-tip="Replay"
                                        onClick={handleReplay}
                                        disabled={!currentTrack}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" />
                                        </svg>
                                    </button>
                                    <button
                                        className={`btn btn-sm tooltip ${
                                            isPlaying ? 'btn-warning' : 'btn-primary'
                                        }`}
                                        data-tip={isPlaying ? 'Pause' : 'Play'}
                                        onClick={handlePlayPause}
                                        disabled={!currentTrack}
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
                                    </button>
                                    <button
                                        className="btn btn-sm btn-error tooltip"
                                        data-tip="Stop"
                                        onClick={handleStop}
                                        disabled={!currentTrack}
                                    >
                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </div>

                                {/* Master Volume Control */}
                                <div className="flex items-center gap-2 bg-base-100 rounded-lg px-3 py-2 shadow-md">
                                    <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.776l-4.375-3.5A1 1 0 014 13h-.5A1.5 1.5 0 012 11.5v-3A1.5 1.5 0 013.5 7H4a1 1 0 01.008-.224l4.375-3.5zM15.95 7.05a.75.75 0 00-1.06 1.06 2.5 2.5 0 010 3.54.75.75 0 001.06 1.06 4 4 0 000-5.66z" clipRule="evenodd" />
                                    </svg>
                                    <input
                                        type="range"
                                        min="0"
                                        max="1"
                                        step="0.05"
                                        value={masterVolume}
                                        onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                        className="range range-xs range-primary w-24"
                                    />
                                    <span className="badge badge-primary badge-sm font-bold min-w-[3rem]">
                                        {Math.round(masterVolume * 100)}%
                                    </span>
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
                        <div className="flex flex-wrap gap-2 justify-start">
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
                                    style={{
                                        width: user?.btnSize || 100,
                                        height: user?.btnSize || 100
                                    }}
                                >
                                    {/* Button Container with Category Border */}
                                    <div
                                        className="relative w-full h-full overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                                        style={{
                                            borderWidth: '3px',
                                            borderStyle: 'solid',
                                            borderColor: button.category_color,
                                        }}
                                        onClick={() => PlaySound(button.sound_filename, button.image_id, button.uploaded_id)}
                                        onContextMenu={(e) => handleContextMenu(e, button.image_id, button.uploaded_id, button.sound_filename)}
                                    >
                                        {/* Background Image - Full Cover */}
                                        <img
                                            src={`${apiUrlImagesFiles}${button.image_filename}`}
                                            alt={button.button_name}
                                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 pointer-events-none"
                                            loading="lazy"
                                        />

                                        {/* Gradient Overlay */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                        {/* Button Name Overlay */}
                                        <div className="absolute bottom-0 left-0 right-0 p-2 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-10 pointer-events-none">
                                            <p className="text-white font-semibold text-xs truncate drop-shadow-lg text-center">
                                                {button.button_name}
                                            </p>
                                        </div>

                                        {/* Favorite Button - Top Left */}
                                        <button
                                            className="absolute top-2 left-2 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-20 pointer-events-auto"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(button.uploaded_id);
                                            }}
                                        >
                                            {isFavorite(button.uploaded_id) ? (
                                                <svg className="w-5 h-5 text-red-500 fill-current" viewBox="0 0 20 20">
                                                    <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                                                </svg>
                                            ) : (
                                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                                                </svg>
                                            )}
                                        </button>

                                        {/* Click Feedback */}
                                        <div className="absolute inset-0 bg-white/20 opacity-0 group-active:opacity-100 transition-opacity duration-75 pointer-events-none" />
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
                    setCurrentImage(null);
                }}
                onError={(e) => {
                    console.error('Audio error:', e);
                    setErrorMessage('Failed to load audio file');
                    setIsPlaying(false);
                }}
                preload="none"
            />
            </div>
            </div>
        </div>
    );
};

export default HomeButtons;
