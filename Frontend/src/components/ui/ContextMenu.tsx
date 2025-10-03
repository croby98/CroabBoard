import React from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

interface ContextMenuProps {
    isVisible: boolean;
    x: number;
    y: number;
    onRemove: () => void;
    onAK47: () => void;
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
    isVisible,
    x,
    y,
    onRemove,
    onAK47,
    onClose,
}) => {
    if (!isVisible) return null;

    return (
        <>
            {/* Invisible overlay to close menu */}
            <div 
                className="fixed inset-0 z-40" 
                onClick={onClose}
            />
            
            {/* Context Menu */}
            <div
                className="fixed z-50 min-w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 backdrop-blur-sm"
                style={{
                    top: y,
                    left: x,
                }}
            >
                <div className="py-2">
                    {/* Remove Option */}
                    <button
                        onClick={onRemove}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 transition-colors duration-150 flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">Remove Button</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Delete from your collection</div>
                        </div>
                    </button>
                    
                    {/* Separator */}
                    <div className="mx-3 my-1 border-t border-gray-200 dark:border-gray-600" />
                    
                    {/* AK47 Spam Option */}
                    <button
                        onClick={onAK47}
                        className="w-full px-4 py-3 text-left hover:bg-yellow-50 dark:hover:bg-yellow-900/20 text-gray-700 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors duration-150 flex items-center gap-3 group"
                    >
                        <div className="w-8 h-8 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 flex items-center justify-center group-hover:scale-110 transition-transform duration-150">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <div className="font-medium">AK47 Spam Mode</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">Play 47 times rapidly</div>
                        </div>
                    </button>
                </div>
            </div>
        </>
    );
};

export default ContextMenu;
