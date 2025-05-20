import { useEffect, useRef, useState } from 'react';

interface Button {
    image_id: number;
    sound_id?: number | null;
    button_name: string;
    image_filename: string;
    category_color: string;
}

const apiUrlImagesFiles = 'http://localhost:5000/api/files/image/';
const apiUrlSoundFiles = 'http://localhost:5000/api/files/sound/';

const HomeButtons: React.FC = () => {
    const [buttons, setButtons] = useState<Button[]>([]);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonSize, setButtonSize] = useState(0);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchUserButtons = async () => {
        setLoading(true);
        setErrorMessage('');
        try {
            const response = await fetch('http://localhost:5000/api/home', {
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
            audioRef.current.play();
        }
    };

    useEffect(() => {
        fetchUserButtons();
    }, []);

    return (
        <div className="p-4">
            <audio ref={audioRef} controls style={{ display: 'none' }} />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {buttons.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                    {buttons.map((button) => (
                         <div
                            key={button.image_id}
                            className={`border-3 rounded shadow hover:shadow-lg`}
                            style={{ borderColor: button.category_color }}
                        >
                            <img
                                className="object-fit"
                                src={`${apiUrlImagesFiles}${button.image_filename}`}
                                alt={button.button_name}
                                loading="lazy"
                                onClick={() => PlaySound(button.sound_id?.toString())}
                                style={{ height: buttonSize, width: buttonSize }}
                            />
                        </div>
                    ))}
                </div>
            ) : (
                !loading && <p>No buttons found for your account.</p>
            )}
        </div>
    );
};

export default HomeButtons;
