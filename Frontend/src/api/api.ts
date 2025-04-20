const API_BASE_URL = 'http://localhost:5000/api'; // Replace with the correct backend URL if hosted differently

export const searchButtonsByCategory = async (category: string) => {
    try {
        const response = await fetch(`${API_BASE_URL}/search?category=${category}`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authenticated routes
        });

        if (!response.ok) {
            const { message } = await response.json();
            throw new Error(message || 'Failed to fetch category data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching category data:', error);
        throw error;
    }
};

export const searchButtons = async () => { // Add `async`
    try {
        const response = await fetch(`${API_BASE_URL}/buttons`, {
            method: 'GET',
            credentials: 'include', // Include cookies for authenticated routes
        });

        if (!response.ok) {
            const { message } = await response.json();
            throw new Error(message || 'Failed to fetch button data');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching button data:', error);
        throw error;
    }
};