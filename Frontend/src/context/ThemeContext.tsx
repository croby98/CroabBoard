import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'synthwave' | 'retro' | 'cyberpunk' | 'valentine' | 'halloween' | 'garden' | 'forest' | 'aqua' | 'lofi' | 'pastel' | 'fantasy' | 'luxury' | 'dracula';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
    availableThemes: { value: Theme; name: string; description: string }[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
    const availableThemes = [
        { value: 'light' as Theme, name: 'Light', description: 'Clean and bright' },
        { value: 'dark' as Theme, name: 'Dark', description: 'Easy on the eyes' },
        { value: 'synthwave' as Theme, name: 'Synthwave', description: 'Retro neon vibes' },
        { value: 'retro' as Theme, name: 'Retro', description: 'Classic vintage look' },
        { value: 'cyberpunk' as Theme, name: 'Cyberpunk', description: 'Futuristic tech' },
        { value: 'valentine' as Theme, name: 'Valentine', description: 'Romantic pink theme' },
        { value: 'halloween' as Theme, name: 'Halloween', description: 'Spooky orange and black' },
        { value: 'garden' as Theme, name: 'Garden', description: 'Natural green tones' },
        { value: 'forest' as Theme, name: 'Forest', description: 'Deep forest greens' },
        { value: 'aqua' as Theme, name: 'Aqua', description: 'Cool blue waters' },
        { value: 'lofi' as Theme, name: 'Lo-Fi', description: 'Muted pastel colors' },
        { value: 'pastel' as Theme, name: 'Pastel', description: 'Soft gentle colors' },
        { value: 'fantasy' as Theme, name: 'Fantasy', description: 'Magical purple theme' },
        { value: 'luxury' as Theme, name: 'Luxury', description: 'Rich gold and black' },
        { value: 'dracula' as Theme, name: 'Dracula', description: 'Dark vampire theme' },
    ];

    const [theme, setCurrentTheme] = useState<Theme>(() => {
        // Check localStorage for saved theme preference
        const savedTheme = localStorage.getItem('croabboard-theme') as Theme;
        return savedTheme || 'dark'; // Default to dark theme
    });

    useEffect(() => {
        // Save theme preference to localStorage
        localStorage.setItem('croabboard-theme', theme);
        
        // Apply theme to document root using data-theme for Daisy UI
        document.documentElement.setAttribute('data-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setCurrentTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
    };

    const setTheme = (newTheme: Theme) => {
        setCurrentTheme(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, availableThemes }}>
            {children}
        </ThemeContext.Provider>
    );
};
