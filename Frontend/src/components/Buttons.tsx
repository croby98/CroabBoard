import {useEffect, useRef, useState} from 'react';
import {searchButtons} from '@/api/api';

interface Button {
    image_id: number;
    image_filename: string;
    image_data: string;
    sound_id?: number | null;
    sound_filename?: string | null;
    sound_data?: string | null;
    button_name: string;
    tri: number;
    category: string;
    category_color: string;
}

const Buttons: React.FC = () =>{
    const [buttons, setButtons] = useState<Button[]>([]); // Fetched buttons
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonSize, setButtonSize] = useState(0);
    /** Ref for the audio element */
    const audioRef = useRef<HTMLAudioElement | null>(null); // Reference for audio element

    const apiUrlImagesFiles = 'http://localhost:5000/api/files/image/';
     const apiUrlSoundFiles = 'http://localhost:5000/api/files/sound/';

    const fetchButtons = async () => {
        setLoading(true); // Start loading spinner
        setErrorMessage(''); // Clear previous errors
        try {
            const response = await searchButtons();
            setButtons(response.buttons || []); // Save fetched buttons
            localStorage.setItem('buttons', JSON.stringify(response.buttons || []));
          } catch (error: any) {
            setErrorMessage(error.message || 'Something went wrong.');
        } finally {
            setLoading(false); // Stop loading spinner
        }
    };

    const getButtonSize = async () => {
        setLoading(true); // Start loading spinner
        setErrorMessage(''); // Clear previous errors
        try {
            const response = await searchButtons();
            setButtonSize(response.btn_size || []); // Save fetched buttons
        } catch (error: any) {
            setErrorMessage(error.message || 'Something went wrong.');
        } finally {
            setLoading(false); // Stop loading spinner
        }
    }

    // Function to play sound in the audio element
    const PlaySound = (sound_filename?: string | null) => {
        if (!sound_filename) {
            console.error('Invalid or missing sound filename.');
            return;
        }
        const soundUrl = `${apiUrlSoundFiles}${sound_filename}`;
        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.play();
        }
    };

    useEffect(() => {
          const cachedButtons = localStorage.getItem('buttons');
          if (cachedButtons) {
               setButtons(JSON.parse(cachedButtons));
          } else {
               fetchButtons();
          }
          getButtonSize();
    }, []); // Empty dependency array ensures it only happens once on the component mount

    useEffect(() => {
        if (buttons.length > 0) {
            // Preload images
            buttons.forEach((button) => {
                if (button.image_filename) {
                    const img = new window.Image();
                    img.src = `${apiUrlImagesFiles}${button.image_filename}`;
                }
                if (button.sound_filename) {
                    const audio = new window.Audio();
                    audio.src = `${apiUrlSoundFiles}${button.sound_filename}`;
                }
            });
        }
    }, [buttons]);

    return (
        <div className="p-4">
            <audio className="flex items-center justify-center p-2 m-auto" ref={audioRef} controls />
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
                            onClick={() => PlaySound(button.sound_filename)}
                            style={{ height: buttonSize, width: buttonSize }}
                        />
                        </div>
                    ))}
                </div>
            ) : (
                !loading && <p>No buttons found for the specified category.</p>
            )}
        </div>
    );
};

export default Buttons;
