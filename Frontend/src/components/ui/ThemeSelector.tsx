import React from 'react';
import { useTheme } from '@/context/ThemeContext';

const ThemeSelector: React.FC = () => {
    const { theme, setTheme, availableThemes } = useTheme();

    return (
        <div className="dropdown dropdown-end">
            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle btn-sm">
                🎨
            </div>
            <div tabIndex={0} className="dropdown-content z-[1] p-2 shadow-2xl bg-base-100 rounded-box w-80">
                <div className="p-4">
                    <h3 className="font-semibold text-lg mb-3">Choose Theme</h3>
                    <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                        {availableThemes.map((themeOption) => (
                            <div
                                key={themeOption.value}
                                className={`card card-compact cursor-pointer transition-all duration-200 hover:scale-105 ${
                                    theme === themeOption.value ? 'ring-2 ring-primary' : 'hover:shadow-md'
                                }`}
                                onClick={() => setTheme(themeOption.value)}
                                data-theme={themeOption.value}
                            >
                                <div className="card-body bg-base-100 rounded-lg border border-base-300">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="flex gap-1">
                                            <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            <div className="w-2 h-2 rounded-full bg-secondary"></div>
                                            <div className="w-2 h-2 rounded-full bg-accent"></div>
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-sm">{themeOption.name}</h4>
                                            <p className="text-xs opacity-60 truncate">{themeOption.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        <div className="flex-1 h-4 rounded bg-base-200"></div>
                                        <div className="flex-1 h-4 rounded bg-base-300"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    
                    <div className="divider text-xs">Current: {availableThemes.find(t => t.value === theme)?.name}</div>
                    
                    <div className="flex justify-between items-center text-xs opacity-60">
                        <span>Powered by Daisy UI</span>
                        <span>{availableThemes.length} themes</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSelector;
