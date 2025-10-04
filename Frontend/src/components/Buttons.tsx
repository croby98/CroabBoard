import { useEffect, useRef, useState } from "react";

interface Button {
    id: number;
    image_id: number;
    sound_id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    category?: string;
    category_color?: string;
    is_linked?: number;
}

const apiUrlImagesFiles = "http://localhost:5000/uploads/images/";
const apiUrlSoundFiles = "http://localhost:5000/uploads/audio/";

const Buttons: React.FC = () => {
    const [buttons, setButtons] = useState<Button[]>([]);
    const [checkedIds, setCheckedIds] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchButtons();
    }, []);

    const fetchButtons = async () => {
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/uploaded", { credentials: "include" });
            const data = await res.json();
            if (data.success) {
                const transformedButtons = data.uploaded.map((button: any) => ({
                    id: button.id,
                    image_id: button.image_id,
                    sound_id: button.sound_id,
                    button_name: button.button_name || 'Untitled',
                    image_filename: button.image_filename,
                    sound_filename: button.sound_filename,
                    category: button.category_name,
                    category_color: button.category_color || '#3B82F6',
                    is_linked: button.is_linked
                }));
                setButtons(transformedButtons);

                // Auto-check linked buttons
                const linkedIds = transformedButtons
                    .filter((button: Button) => button.is_linked)
                    .map((button: Button) => button.id);
                setCheckedIds(linkedIds);
            } else {
                setErrorMessage(data.message || "Failed to load buttons");
            }
        } catch (error: any) {
            setErrorMessage(error.message || "An error occurred");
        } finally {
            setLoading(false);
        }
    };

    const handlePlaySound = (soundFilename: string) => {
        if (audioRef.current) {
            audioRef.current.src = `${apiUrlSoundFiles}${soundFilename}`;
            audioRef.current.play();
        }
    };

    const handleCheckboxChange = async (id: number) => {
        const button = buttons.find(b => b.id === id);
        if (!button) return;

        const isCurrentlyChecked = checkedIds.includes(id);

        try {
            if (isCurrentlyChecked) {
                // Unlink the button
                await fetch(`http://localhost:5000/api/link/${id}`, {
                    method: "DELETE",
                    credentials: "include",
                });
                setCheckedIds(prev => prev.filter(cid => cid !== id));
                setSuccessMessage("Button unlinked successfully");
            } else {
                // Link the button
                await fetch("http://localhost:5000/api/link", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({ uploadedId: id })
                });
                setCheckedIds(prev => [...prev, id]);
                setSuccessMessage("Button linked successfully");
            }

            // Refresh the buttons list to update linked status
            fetchButtons();
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update button");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    const handleSelectAll = async () => {
        const allLinked = buttons.every(b => b.is_linked);
        const allUnlinked = buttons.every(b => !b.is_linked);

        try {
            if (allLinked) {
                // Unlink all buttons
                const promises = buttons.map(button =>
                    fetch(`http://localhost:5000/api/link/${button.id}`, {
                        method: "DELETE",
                        credentials: "include",
                    })
                );
                await Promise.all(promises);
                setCheckedIds([]);
                setSuccessMessage("All buttons unlinked");
            } else {
                // Link all unlinked buttons
                const unlinkedButtons = buttons.filter(b => !b.is_linked);
                const promises = unlinkedButtons.map(button =>
                    fetch("http://localhost:5000/api/link", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({ uploadedId: button.id })
                    })
                );
                await Promise.all(promises);
                setCheckedIds(buttons.map(b => b.id));
                setSuccessMessage("All buttons linked");
            }

            fetchButtons(); // Refresh to show updated linked status
            setTimeout(() => setSuccessMessage(""), 2000);
        } catch (error: any) {
            setErrorMessage(error.message || "Failed to update buttons");
            setTimeout(() => setErrorMessage(""), 3000);
        }
    };

    if (loading && buttons.length === 0) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">Available Buttons</h1>
                        <p className="opacity-70">Browse and add buttons to your collection</p>
                    </div>
                    {checkedIds.length > 0 && (
                        <div className="badge badge-primary badge-lg">
                            {checkedIds.length} selected
                        </div>
                    )}
                </div>

                {errorMessage && (
                    <div className="alert alert-error mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                {successMessage && (
                    <div className="alert alert-success mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{successMessage}</span>
                    </div>
                )}

                <div className="card bg-base-100 shadow-xl mb-6">
                    <div className="card-body">
                        <div className="flex justify-center items-center">
                            <div className="form-control">
                                <label className="label cursor-pointer gap-3">
                                    <input
                                        type="checkbox"
                                        className="checkbox checkbox-primary"
                                        checked={buttons.length > 0 && buttons.every(b => b.is_linked)}
                                        onChange={handleSelectAll}
                                    />
                                    <span className="label-text font-medium">
                                        {buttons.every(b => b.is_linked) && buttons.length > 0
                                            ? "Unlink All"
                                            : "Link All"}
                                    </span>
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                {buttons.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                        {buttons.map((button) => (
                            <div
                                key={button.id}
                                className={`card bg-base-100 shadow-lg hover:shadow-xl transition-all relative ${
                                    checkedIds.includes(button.id) ? 'ring-2 ring-primary' : ''
                                } ${button.is_linked ? 'opacity-75' : ''}`}
                            >
                                <figure className="px-3 pt-3 relative">
                                    <img
                                        src={`${apiUrlImagesFiles}${button.image_filename}`}
                                        alt={button.button_name}
                                        className="rounded-lg w-full h-32 object-cover cursor-pointer hover:opacity-80 transition-opacity"
                                        onClick={() => handlePlaySound(button.sound_filename)}
                                    />
                                    <div className="absolute top-4 right-4">
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-primary checkbox-sm"
                                            checked={checkedIds.includes(button.id)}
                                            onChange={() => handleCheckboxChange(button.id)}
                                        />
                                    </div>
                                    {button.is_linked && (
                                        <div className="absolute top-4 left-4">
                                            <div className="badge badge-success badge-sm">
                                                ✓ Linked
                                            </div>
                                        </div>
                                    )}
                                </figure>
                                <div className="card-body p-3">
                                    <h3 className="card-title text-sm truncate">{button.button_name}</h3>
                                    {button.category && (
                                        <div
                                            className="badge badge-sm"
                                            style={{ backgroundColor: button.category_color, color: 'white' }}
                                        >
                                            {button.category}
                                        </div>
                                    )}
                                    <button
                                        className="btn btn-sm btn-ghost w-full mt-2"
                                        onClick={() => handlePlaySound(button.sound_filename)}
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Play
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                        </svg>
                        <p className="opacity-60 text-lg">No buttons available</p>
                    </div>
                )}
            </div>

            <audio ref={audioRef} />
        </div>
    );
};

export default Buttons;
