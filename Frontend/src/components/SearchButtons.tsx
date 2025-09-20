import React, { useState, useEffect } from 'react';
import { searchButtonsByCategory } from '@/api/api';
import debounce from 'lodash.debounce';
import { useRef } from 'react';

interface Button {
    image_id: number;
    image_filename: string;
    sound_id?: number | null;
    sound_filename?: string | null;
    button_name: string;
    tri: number;
    category: string;
}

const SearchButtons: React.FC = () => {
    const [category, setCategory] = useState(''); // Input field for category
    const [buttons, setButtons] = useState<Button[]>([]); // Fetched buttons
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [buttonSize, setButtonSize] = useState(150);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const apiUrlImagesFiles = 'http://localhost:5000/api/files/image/';
    const apiUrlSoundFiles = 'http://localhost:5000/api/files/sound/';

    // Function to fetch buttons based on category
    const fetchButtons = async (category: string) => {
        if (!category.trim()) {
            setButtons([]);
            setErrorMessage(''); // Clear the error message
            return;
        }

        setErrorMessage('');
        setLoading(true);

        try {
            const response = await searchButtonsByCategory(category.trim());
            setButtons(response.buttons || []);
        } catch (error: any) {
            setErrorMessage(error.message || 'Something went wrong.');
            setButtons([]);
        } finally {
            setLoading(false);
        }
    };

    // Debounced search function to limit API calls during typing
    const debouncedFetchButtons = debounce((category: string) => {
        fetchButtons(category);
    }, 50); // Debounce with a 500ms delay

    // Effect to trigger the debounced search function when the category changes
    useEffect(() => {
        debouncedFetchButtons(category);
        return () => {
            debouncedFetchButtons.cancel(); // Clean up debounce on unmount
        };
    }, [category]);

    const playSound = (soundFilename?: string | null) => {
        if (!soundFilename || !audioRef.current) return;
        const soundUrl = `${apiUrlSoundFiles}${soundFilename}`;
        audioRef.current.src = soundUrl;
        audioRef.current.volume = 0.5;
        audioRef.current.play();
    };

    return (
        <div className="flex flex-col justify-center items-center p-4 text-white">
            <audio ref={audioRef} controls className="mb-4" />
            <h1 className="text-xl font-bold mb-4">Search Buttons by Category</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter category name"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded p-2 mr-2 bg-gray-700 text-white border-gray-600"
                />
                {loading && <span className="text-gray-500 ml-2">Loading...</span>}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {buttons.length > 0 ? (
                <div className="flex flex-wrap gap-4 justify-center">
                    {buttons.map((button) => (
                        <div
                            key={button.image_id}
                            className="border-3 rounded shadow hover:shadow-lg sound-button text-center bg-gray-800"
                        >
                            <img
                                className="object-cover cursor-pointer"
                                src={`${apiUrlImagesFiles}${button.image_filename}`}
                                alt={button.button_name}
                                loading="lazy"
                                onClick={() => playSound(button.sound_filename)}
                                style={{ height: buttonSize, width: buttonSize }}
                            />
                            <div className="p-2">
                                <p className="font-bold text-sm">{button.button_name}</p>
                                <p className="text-xs text-gray-400">Category: {button.category}</p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                !loading && category.trim() && <p>No buttons found for the specified category.</p>
            )}
        </div>
    );
};

export default SearchButtons;