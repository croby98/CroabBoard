import { useEffect, useRef, useState } from "react";

interface Button {
    id: number; // uploaded_id from the database
    image_id: number;
    sound_id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    category?: string;
    category_color?: string;
}

const apiUrlImagesFiles = "http://localhost:5000/uploads/images/";
const apiUrlSoundFiles = "http://localhost:5000/uploads/audio/";

const Buttons: React.FC = () => {
    const [buttons, setButtons] = useState<Button[]>([]);
    const [checkedIds, setCheckedIds] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Fetch all buttons
    useEffect(() => {
        const fetchButtons = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/uploaded", { credentials: "include" });
                const data = await res.json();
                if (data.success) {
                    // Transform uploaded data to match Button interface
                    const transformedButtons = data.uploaded.map((button: any) => ({
                        id: button.id, // uploaded_id
                        image_id: button.image_id,
                        sound_id: button.sound_id,
                        button_name: button.button_name || 'Untitled',
                        image_filename: button.image_filename,
                        sound_filename: button.sound_filename,
                        category: button.category_name,
                        category_color: button.category_color || '#3B82F6'
                    }));
                    setButtons(transformedButtons);
                    
                    // Get user button size
                    const userRes = await fetch("http://localhost:5000/api/me", { credentials: "include" });
                    const userData = await userRes.json();
                    if (userData.success) {
                        // Button size preference would go here if needed
                    }
                } else {
                    setErrorMessage(data.message || "Failed to fetch buttons");
                }
            } catch (e: any) {
                setErrorMessage(e.message || "Error fetching buttons");
            }
        };
        fetchButtons();
    }, []);

    // Fetch user's linked buttons
    useEffect(() => {
        const fetchChecked = async () => {
            try {
                const res = await fetch("http://localhost:5000/api/linked", { credentials: "include" });
                const data = await res.json();
                if (data.success && data.linked) {
                    // Extract the uploaded_ids from linked buttons
                    setCheckedIds(data.linked.map((b: { uploaded_id: number }) => b.uploaded_id));
                }
            } catch (e) {
                // ignore
            }
        };
        fetchChecked();
    }, [buttons.length]);

    // Play sound
    const playSound = (sound_filename: string) => {
        if (!sound_filename || !audioRef.current) return;
        audioRef.current.src = `${apiUrlSoundFiles}${sound_filename}`;
        audioRef.current.currentTime = 0;
        audioRef.current.volume = 0.5;
        audioRef.current.play();
    };

    // Checkbox handler - Link/Unlink button to user
    const handleCheckbox = async (checked: boolean, uploadedId: number) => {
        try {
            if (checked) {
                // Link button to user
                await fetch(`http://localhost:5000/api/link`, {
                    method: "POST",
                    headers: { 'Content-Type': 'application/json' },
                    credentials: "include",
                    body: JSON.stringify({ uploadedId, tri: 0 })
                });
                setCheckedIds([...checkedIds, uploadedId]);
            } else {
                // Unlink button from user
                await fetch(`http://localhost:5000/api/link/${uploadedId}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                setCheckedIds(checkedIds.filter(id => id !== uploadedId));
            }
        } catch (error) {
            console.error('Error linking/unlinking button:', error);
        }
    };

    const handleToggleButtons = async () => {
        setLoading(true);
        try {
            // TO DO: implement toggle buttons logic
        } catch (error) {
            console.error('Error toggling buttons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckboxChange = (id: number, checked: boolean) => {
        handleCheckbox(checked, id);
    };

    return (
        <div className="min-h-screen bg-base-200 p-4">
            <div className="max-w-7xl mx-auto space-y-6">
                {/* Page Header */}
                <div className="hero bg-base-100 rounded-2xl shadow-xl p-6">
                    <div className="hero-content w-full">
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 w-full">
                            <div>
                                <h1 className="text-4xl font-bold mb-2">🎵 All Sound Buttons</h1>
                                <p className="text-lg opacity-60">Browse and manage all available sound buttons</p>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="stats stats-vertical lg:stats-horizontal shadow">
                                        <div className="stat">
                                            <div className="stat-title">Total Buttons</div>
                                            <div className="stat-value text-primary">{buttons.length}</div>
                                        </div>
                                        {checkedIds.length > 0 && (
                                            <div className="stat">
                                                <div className="stat-title">Selected</div>
                                                <div className="stat-value text-secondary">{checkedIds.length}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {checkedIds.length > 0 && (
                                <div className="flex flex-col gap-2">
                                    <button
                                        onClick={handleToggleButtons}
                                        disabled={loading}
                                        className="btn btn-primary gap-2"
                                    >
                                        {loading && <span className="loading loading-spinner loading-xs"></span>}
                                        {loading ? 'Processing...' : 'Add to Collection'}
                                        <div className="badge badge-neutral">{checkedIds.length}</div>
                                    </button>
                                    <p className="text-xs opacity-60 text-center">Selected buttons will be added</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error State */}
                {errorMessage && (
                    <div className="alert alert-error mb-6">
                        <svg className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {/* Empty State */}
                {buttons.length === 0 && !errorMessage && (
                    <div className="hero min-h-64">
                        <div className="hero-content text-center">
                            <div>
                                <div className="text-9xl mb-4">🎵</div>
                                <h1 className="text-2xl font-bold">No buttons available</h1>
                                <p className="py-2 opacity-60">Upload some sounds to get started!</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Buttons Collection */}
                <div className="card bg-base-100 shadow-xl">
                    <div className="card-body p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="card-title text-2xl">Available Sound Buttons</h2>
                            {buttons.length > 0 && (
                                <div className="text-sm opacity-60">
                                    Showing {buttons.length} buttons
                                </div>
                            )}
                        </div>
                        
                        {buttons.length > 0 ? (
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-4">
                                {buttons.map(button => (
                                    <div
                                        key={button.id}
                                        className="group relative"
                                    >
                                        <div className={`card bg-base-200 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${
                                            checkedIds.includes(button.id) 
                                                ? 'border-primary ring-2 ring-primary ring-opacity-50' 
                                                : 'border-transparent hover:border-primary/50'
                                        }`}>
                                            {/* Checkbox */}
                                            <div className="absolute top-2 left-2 z-20">
                                                <input
                                                    type="checkbox"
                                                    className="checkbox checkbox-primary checkbox-sm"
                                                    checked={checkedIds.includes(button.id)}
                                                    onChange={(e) => handleCheckboxChange(button.id, e.target.checked)}
                                                />
                                            </div>

                                            <figure className="relative overflow-hidden">
                                                <img
                                                    src={`${apiUrlImagesFiles}${button.image_filename}`}
                                                    alt={button.button_name}
                                                    loading="lazy"
                                                    onClick={() => playSound(button.sound_filename)}
                                                    className="w-full h-24 object-cover cursor-pointer transition-transform duration-300 group-hover:scale-110"
                                                />
                                                
                                                {/* Play overlay */}
                                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                                                    <button 
                                                        onClick={() => playSound(button.sound_filename)}
                                                        className="btn btn-circle btn-primary btn-sm"
                                                    >
                                                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                                        </svg>
                                                    </button>
                                                </div>
                                                
                                                {/* Category indicator */}
                                                <div 
                                                    className="absolute top-2 right-2 w-3 h-3 rounded-full shadow-lg ring-1 ring-white/30"
                                                    style={{ backgroundColor: button.category_color }}
                                                />
                                                
                                                {/* Selection indicator */}
                                                {checkedIds.includes(button.id) && (
                                                    <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                                                        <div className="badge badge-primary badge-lg">
                                                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                )}
                                            </figure>
                                            
                                            <div className="card-body p-3">
                                                <h3 className="font-medium text-sm truncate text-center">{button.button_name}</h3>
                                                {button.category && (
                                                    <p className="text-xs opacity-60 truncate text-center">{button.category}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="text-6xl mb-4">🎵</div>
                                <h3 className="text-xl font-semibold mb-2">No buttons available</h3>
                                <p className="opacity-60">Upload some sounds to get started!</p>
                            </div>
                        )}
                    </div>
                </div>

                <audio ref={audioRef} />
            </div>
        </div>
    );
};

export default Buttons;
