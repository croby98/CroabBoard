import { useEffect, useRef, useState } from "react";

interface Button {
    image_id: number;
    sound_id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    category?: string;
    category_color?: string;
}

const apiUrlImagesFiles = "http://localhost:5000/api/files/image/";
const apiUrlSoundFiles = "http://localhost:5000/api/files/sound/";

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
                const res = await fetch("http://localhost:5000/api/buttons", { credentials: "include" });
                const data = await res.json();
                if (data.success) {
                    setButtons(data.buttons || []);
                    setBtnSize(data.btn_size || 150);
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
                const res = await fetch("http://localhost:5000/api/getchecked", { credentials: "include" });
                const data = await res.json();
                if (data.ids) {
                    setCheckedIds(data.ids.map((b: { id: number }) => b.id));
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

    // Checkbox handler
    const handleCheckbox = async (checked: boolean, image_id: number, sound_id: number) => {
        if (checked) {
            await fetch(`http://localhost:5000/api/add_file/${image_id}/${sound_id}`, {
                method: "POST",
                credentials: "include",
            });
        } else {
            await fetch(`http://localhost:5000/api/delete_image/${image_id}`, {
                method: "DELETE",
                credentials: "include",
            });
        }
        // Refresh checked IDs
        const res = await fetch("http://localhost:5000/api/getchecked", { credentials: "include" });
        const data = await res.json();
        if (data.ids) {
            setCheckedIds(data.ids.map((b: { id: number }) => b.id));
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
                                checked={checkedIds.includes(button.image_id)}
                                onChange={e => handleCheckbox(e.target.checked, button.image_id, button.sound_id)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Buttons;
