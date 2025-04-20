import React, {useEffect, useRef, useState} from 'react';
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
}

const Buttons: React.FC = () =>{
    const [buttons, setButtons] = useState<Button[]>([]); // Fetched buttons
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonSize, setButtonSize] = useState(0);
    /** Ref for the audio element */
    const audioRef = useRef<HTMLAudioElement | null>(null); // Reference for audio element

    const apiUrlFiles = 'http://localhost:5000/api/files/';

    const fetchButtons = async () => {
        setLoading(true); // Start loading spinner
        setErrorMessage(''); // Clear previous errors
        try {
            const response = await searchButtons();
            setButtons(response.buttons || []); // Save fetched buttons
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
    const PlaySound = (sound_id?: number | null) => {
        if (!sound_id) {
            console.error('Invalid or missing sound ID.');
            return;
        }

        // Construct the sound URL
        const soundUrl = `${apiUrlFiles}${sound_id}`;

        // If the audioRef exists, update its `src` and play the sound
        if (audioRef.current) {
            audioRef.current.src = soundUrl; // Set the new source for the audio element
            audioRef.current.volume = 0.5;
            audioRef.current.play().catch((error) => {
                console.error(`Error playing sound with ID ${sound_id}:`, error);
            });
        }
    };


    useEffect(() => {
        getButtonSize();
        fetchButtons(); // Call the async function
    }, []); // Empty dependency array ensures it only happens once on the component mount


    return (
        <div className="p-4 text-white">
            <audio className="flex items-center justify-center p-2 m-auto" ref={audioRef} controls />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {buttons.length > 0 ? (
                <div className="flex  gap-2">
                    {buttons.map((button) => (
                        <div
                            key={button.image_id}
                            className="border rounded shadow hover:shadow-lg"
                        >
                        <img className="rounded object-cover"
                             src={`${apiUrlFiles}${button.image_id}`}
                             alt={button.button_name}
                             width={buttonSize}
                             height={buttonSize}
                             onClick={() => PlaySound(button.sound_id)}
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