import { useEffect, useRef, useState } from 'react';

interface Button {
    image_id: number;
    uploaded_id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    category_color: string;
}

const apiUrlImagesFiles = 'http://localhost:5000/api/files/image/';
const apiUrlSoundFiles = 'http://localhost:5000/api/files/sound/';

let playCount = 0;
let intervalId: ReturnType<typeof setInterval> | null = null;

const HomeButtons: React.FC = () => {
    const [buttons, setButtons] = useState<Button[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonSize, setButtonSize] = useState(0);
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
            const response = await fetch('http://localhost:5000/api/index', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            if (response.ok && data.success) {
                setButtons(data.buttons || []);
                setButtonSize(data.btn_size || 150);
            } else {
                setErrorMessage(data.message || 'Failed to fetch user buttons');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    const PlaySound = (sound_filename?: string | null) => {
        if (!sound_filename) return;
        const soundUrl = `${apiUrlSoundFiles}${sound_filename}`;
        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.volume = 0.5;
            audioRef.current.play();
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
            audioRef.current.volume = 0.5;
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
        <div className="p-4">
            <audio ref={audioRef} controls className="flex items-center justify-center p-2 m-auto" />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {buttons.length > 0 ? (
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
            ) : (
                !loading && <p>No buttons found for your account.</p>
            )}
        </div>
    );
};

export default HomeButtons;
