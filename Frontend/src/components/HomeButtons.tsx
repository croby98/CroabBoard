import { useEffect, useRef, useState } from 'react';

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
    const [buttons, setButtons] = useState<Button[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonSize, setButtonSize] = useState(0);
    const [volume, setVolume] = useState(0.5);
    const [showVolumeControl, setShowVolumeControl] = useState(false);
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
        console.log('Fetching user buttons...');
        
        try {
            const response = await fetch('http://localhost:5000/api/linked', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            
            console.log('Linked buttons response:', response.status, data);
            
            if (response.ok && data.success) {
                console.log('Found buttons:', data.linked.length);
                console.log('First button sample:', data.linked[0]);
                
                // Transform the data to match the expected format
                const transformedButtons = data.linked.map((button: any) => ({
                    image_id: button.image_id,
                    uploaded_id: button.uploaded_id,
                    button_name: button.button_name || 'Untitled',
                    image_filename: button.image_filename,
                    sound_filename: button.sound_filename,
                    category_color: button.category_color || '#3B82F6'
                }));
                
                console.log('Transformed first button:', transformedButtons[0]);
                console.log('Image URL will be:', `${apiUrlImagesFiles}${transformedButtons[0]?.image_filename}`);
                console.log('Sound URL will be:', `${apiUrlSoundFiles}${transformedButtons[0]?.sound_filename}`);
                
                setButtons(transformedButtons);
                
                // Get user button size from /api/me endpoint
                const userResponse = await fetch('http://localhost:5000/api/me', {
                    credentials: 'include'
                });
                const userData = await userResponse.json();
                if (userData.success) {
                    setButtonSize(userData.user?.btnSize || 150);
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

    const PlaySound = (sound_filename?: string | null) => {
        if (!sound_filename) {
            console.log('No sound filename provided');
            return;
        }
        
        const soundUrl = `${apiUrlSoundFiles}${sound_filename}`;
        console.log('Playing sound:', soundUrl);
        
        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.volume = volume;
            audioRef.current.play().catch(error => {
                console.error('Error playing sound:', error);
            });
        } else {
            console.error('Audio ref not available');
        }
    };

    useEffect(() => {
        fetchUserButtons();
    }, []);

    const PlayAK47Sound = (sound_filename: string) => {
        if (!sound_filename) return;
        const soundUrl = `${apiUrlSoundFiles}${sound_filename}`;
        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.currentTime = 0;
            audioRef.current.volume = volume;
            audioRef.current.play();
        }
    };

    // Start spamming
    const startSpammingAK47Sound = (sound_filename: string) => {
          if (intervalId) clearInterval(intervalId);

          playCount = 0;
          intervalId = setInterval(() => {
               PlayAK47Sound(sound_filename);
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

    const handleCloseContextMenu = () => setContextMenu(null);

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
        startSpammingAK47Sound(contextMenu.soundFilename);
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
        await fetch('http://localhost:5000/api/buttons', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ positions }),
        });
    } catch (e) {
        setErrorMessage('Failed to update button order.');
    }
    };

    return (
        <div className="flex flex-col items-center p-4 text-white">
            <audio ref={audioRef} />
            
            {/* Volume Control */}
            <div className="mb-4 flex items-center gap-4">
                <button
                    onClick={() => setShowVolumeControl(!showVolumeControl)}
                    className="flex items-center gap-2 px-3 py-2 bg-gray-700 rounded hover:bg-gray-600 transition-colors"
                >
                    <span>🔊</span>
                    <span>Volume: {Math.round(volume * 100)}%</span>
                </button>
                {showVolumeControl && (
                    <div className="flex items-center gap-2">
                        <span className="text-sm">0%</span>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-32"
                        />
                        <span className="text-sm">100%</span>
                    </div>
                )}
            </div>

            <div className="flex flex-wrap gap-4 justify-center items-center">
                {loading && <div className="text-center text-white">Loading your buttons...</div>}
                {errorMessage && <div className="text-center text-red-500">{errorMessage}</div>}
                {!loading && !errorMessage && buttons.length > 0 && (
                <div className="flex flex-wrap gap-2" id="sound-buttons">
                    {buttons.map((button, idx) => (
                        <div
                            key={button.image_id}
                            className="border-3 rounded shadow hover:shadow-lg sound-button"
                            style={{ borderColor: button.category_color, opacity: draggedIndex === idx ? 0.5 : 1 }}
                            draggable
                            onDragStart={() => handleDragStart(idx)}
                            onDragOver={e => handleDragOver(e, idx)}
                            onDrop={handleDrop}
                        >
                            <img
                                className="object-fit"
                                src={`${apiUrlImagesFiles}${button.image_filename}`}
                                alt={button.button_name}
                                loading="lazy"
                                onClick={() => PlaySound(button.sound_filename)}
                                onContextMenu={e => handleContextMenu(e, button.image_id, button.sound_filename)}
                                style={{ height: buttonSize, width: buttonSize, cursor: 'pointer' }}
                            />
                        </div>
                    ))}
                    {/* Custom Context Menu */}
                    {contextMenu?.visible && (
                        <ul
                            className="context-menu"
                            style={{
                                position: 'fixed',
                                top: contextMenu.y,
                                left: contextMenu.x,
                                zIndex: 1000,
                                background: '#222',
                                color: '#fff',
                                borderRadius: 8,
                                padding: 2,
                                margin: 2,
                                listStyle: 'none',
                                minWidth: 120,
                                boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                            }}
                        >
                            <li style={{ padding: '8px', cursor: 'pointer' }} onClick={handleRemove}>Remove</li>
                            <li style={{ padding: '8px', cursor: 'pointer' }} onClick={handleAK47}>AK47</li>
                        </ul>
                    )}
                </div>
                )}
                {!loading && !errorMessage && buttons.length === 0 && (
                    <p>No buttons found for your account.</p>
                )}
            </div>
        </div>
    );
};

export default HomeButtons;
