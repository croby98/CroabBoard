import React from 'react';

interface SoundButtonProps {
    button: {
        image_id: number;
        button_name: string;
        image_filename: string;
        sound_filename: string;
        category_color: string;
    };
    size: number;
    isBeingDragged?: boolean;
    onPlay: () => void;
    onContextMenu: (e: React.MouseEvent) => void;
    onDragStart: () => void;
    onDragOver: (e: React.DragEvent) => void;
    onDrop: () => void;
}

const SoundButton: React.FC<SoundButtonProps> = ({
    button,
    size,
    isBeingDragged = false,
    onPlay,
    onContextMenu,
    onDragStart,
    onDragOver,
    onDrop,
}) => {
    const apiUrlImagesFiles = 'http://localhost:5000/uploads/images/';
    
    return (
        <div
            className={`group relative cursor-pointer select-none transition-all duration-300 hover:scale-105 ${
                isBeingDragged ? 'opacity-50 rotate-6' : 'opacity-100'
            }`}
            draggable
            onDragStart={onDragStart}
            onDragOver={onDragOver}
            onDrop={onDrop}
        >
            {/* Main Button Container */}
            <div 
                className="relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 backdrop-blur-sm"
                style={{ 
                    width: size, 
                    height: size,
                    borderWidth: '3px',
                    borderStyle: 'solid',
                    borderColor: button.category_color,
                }}
            >
                {/* Background Image */}
                <img
                    src={`${apiUrlImagesFiles}${button.image_filename}`}
                    alt={button.button_name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onClick={onPlay}
                    onContextMenu={onContextMenu}
                    loading="lazy"
                />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Button Name Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-3 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h4 className="text-white font-semibold text-sm truncate drop-shadow-lg">
                        {button.button_name}
                    </h4>
                </div>
                
                {/* Category Color Accent */}
                <div 
                    className="absolute top-2 right-2 w-3 h-3 rounded-full shadow-lg ring-2 ring-white/20"
                    style={{ backgroundColor: button.category_color }}
                />
                
                {/* Glow Effect */}
                <div 
                    className="absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-30 transition-opacity duration-300 blur-md -z-10"
                    style={{ 
                        backgroundColor: button.category_color,
                        boxShadow: `0 0 30px ${button.category_color}`,
                    }}
                />
                
                {/* Click Feedback */}
                <div className="absolute inset-0 bg-white/10 opacity-0 group-active:opacity-100 transition-opacity duration-75 rounded-2xl" />
            </div>
            
            {/* Floating Animation */}
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        </div>
    );
};

export default SoundButton;
