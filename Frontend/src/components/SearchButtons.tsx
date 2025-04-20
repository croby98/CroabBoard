import React, { useState, useEffect } from 'react';
import { searchButtonsByCategory } from '@/api/api';
import debounce from 'lodash.debounce';

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

    return (
        <div className="flex flex-col justify-center items-center p-4 text-white">
            <h1 className="text-xl font-bold mb-4">Search Buttons by Category</h1>
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Enter category name"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="border rounded p-2 mr-2"
                />
                {loading && <span className="text-gray-500 ml-2">Loading...</span>}
            </div>
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            {buttons.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {buttons.map((button) => (
                        <div
                            key={button.image_id}
                            className="p-4 border rounded shadow hover:shadow-lg"
                        >
                            <p className="font-bold">{button.button_name}</p>
                            <p>Category: {button.category}</p>
                            <p>Image ID: {button.image_id}</p>
                            {button.sound_id && (
                                <p>Sound ID: {button.sound_id}</p>
                            )}
                            <p>Order: {button.tri}</p>
                        </div>
                    ))}
                </div>
            ) : (
                !loading && <p>No buttons found for the specified category.</p>
            )}
        </div>
    );
};

export default SearchButtons;