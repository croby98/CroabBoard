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
    const [btnSize, setBtnSize] = useState(150);
    const [errorMessage, setErrorMessage] = useState("");
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
                        setBtnSize(userData.user?.btnSize || 150);
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

    return (
        <div className="p-4">
            <audio ref={audioRef} controls className="flex items-center justify-center p-2 m-auto" />
            {errorMessage && <p className="text-red-500">{errorMessage}</p>}
            <div className="flex flex-wrap gap-2" id="sound-buttons">
                {buttons.map((button) => (
                    <div
                        key={button.image_id}
                        className="border-3 rounded shadow hover:shadow-lg sound-button text-center"
                        style={{ borderColor: button.category_color}}
                    >
                        <img
                            className="object-fit"
                            src={`${apiUrlImagesFiles}${button.image_filename}`}
                            alt={button.button_name}
                            loading="lazy"
                            onClick={() => playSound(button.sound_filename)}
                            style={{ height: btnSize, width: btnSize, cursor: 'pointer' }}
                        />
                        {/* Checkbox directly under the button */}
                        <div>
                            <input
                                className="mt-2 mb-2"
                                type="checkbox"
                                checked={checkedIds.includes(button.id)}
                                onChange={e => handleCheckbox(e.target.checked, button.id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Buttons;
