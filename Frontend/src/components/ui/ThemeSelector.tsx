import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const ThemeSelector: React.FC = () => {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle">
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                    />
                </svg>
            </label>
            <div
                tabIndex={0}
                className="dropdown-content mt-3 z-[1] p-4 shadow-2xl bg-base-100 rounded-box w-72"
            >
                <h3 className="font-bold text-lg mb-3 text-center">Choose Theme</h3>
                <div className="max-h-96 overflow-y-auto">
                    <div className="grid grid-cols-1 gap-2">
                        {availableThemes.map((themeOption) => (
                            <button
                                key={themeOption.value}
                                className={`btn btn-sm justify-start gap-2 ${
                                    theme === themeOption.value
                                        ? 'btn-primary'
                                        : 'btn-ghost'
                                }`}
                                onClick={() => setTheme(themeOption.value)}
                                data-theme={themeOption.value}
                            >
                                <div className="flex gap-1">
                                    <div className="w-3 h-3 rounded-full bg-primary"></div>
                                    <div className="w-3 h-3 rounded-full bg-secondary"></div>
                                    <div className="w-3 h-3 rounded-full bg-accent"></div>
                                </div>
                                <div className="flex-1 text-left">
                                    <span className="font-medium">{themeOption.name}</span>
                                </div>
                                {theme === themeOption.value && (
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="h-4 w-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M5 13l4 4L19 7"
                                        />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="divider my-2"></div>
                <div className="text-center text-xs opacity-60">
                    {availableThemes.length} themes available
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;