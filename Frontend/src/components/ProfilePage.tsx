import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
    id: number;
    username: string;
    btn_size: number;
}

interface Button {
    image_id: number;
    sound_id?: number | null;
    button_name: string;
    image_filename: string;
    sound_filename?: string | null;
    category_color?: string | null;
}

const ProfilePage: React.FC = () => {
    const { logout } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [buttons, setButtons] = useState<Button[]>([]);
    const [buttonSize, setButtonSize] = useState(150);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const apiUrlImagesFiles = 'http://localhost:5000/api/files/image/';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            const response = await fetch('http://localhost:5000/api/profil', {
                method: 'GET',
                credentials: 'include',
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setButtons(data.buttons || []);
                setButtonSize(data.btn_size || 150);
                
                // Get current user info
                const userResponse = await fetch('http://localhost:5000/api/me', {
                    method: 'GET',
                    credentials: 'include',
                });
                const userData = await userResponse.json();
                if (userResponse.ok && userData.success) {
                    setProfile({
                        id: userData.user.id,
                        username: userData.user.username,
                        btn_size: data.btn_size || 150
                    });
                }
            } else {
                setErrorMessage(data.message || 'Failed to fetch profile');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleButtonSizeChange = async (newSize: number) => {
        try {
            const response = await fetch(`http://localhost:5000/api/button_size/${newSize}`, {
                method: 'POST',
                credentials: 'include',
            });

            if (response.ok) {
                setButtonSize(newSize);
                setSuccessMessage('Button size updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage('Failed to update button size');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update button size');
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (newPassword !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setErrorMessage('Password must be at least 6 characters long');
            return;
        }

        try {
            const response = await fetch('http://localhost:5000/api/reset_password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    password: newPassword,
                    confirmPassword: confirmPassword,
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage('Password updated successfully');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to update password');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update password');
        }
    };

    const handleDeleteButton = async (imageId: number, soundId: number | null) => {
        if (!window.confirm('Are you sure you want to delete this button?')) {
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/delete_from_bdd/${imageId}/${soundId || 0}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            if (response.ok) {
                setButtons(buttons.filter(b => b.image_id !== imageId));
                setSuccessMessage('Button deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage('Failed to delete button');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete button');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-white">Loading profile...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-white p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">User Profile</h1>

                {errorMessage && (
                    <div className="mb-4 p-4 bg-red-900 border border-red-700 rounded text-red-100">
                        {errorMessage}
                    </div>
                )}

                {successMessage && (
                    <div className="mb-4 p-4 bg-green-900 border border-green-700 rounded text-green-100">
                        {successMessage}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                            {profile && (
                                <div className="space-y-3">
                                    <div>
                                        <label className="text-gray-400 text-sm">Username</label>
                                        <p className="text-white font-medium">{profile.username}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm">User ID</label>
                                        <p className="text-white font-medium">{profile.id}</p>
                                    </div>
                                    <div>
                                        <label className="text-gray-400 text-sm">Total Buttons</label>
                                        <p className="text-white font-medium">{buttons.length}</p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Button Size Settings */}
                        <div className="bg-gray-800 rounded-lg p-6 mt-6">
                            <h2 className="text-xl font-semibold mb-4">Button Size</h2>
                            <div className="space-y-3">
                                <label className="text-gray-400 text-sm">Current Size: {buttonSize}px</label>
                                <input
                                    type="range"
                                    min="100"
                                    max="300"
                                    value={buttonSize}
                                    onChange={(e) => handleButtonSizeChange(parseInt(e.target.value))}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-gray-400">
                                    <span>100px</span>
                                    <span>300px</span>
                                </div>
                            </div>
                        </div>

                        {/* Password Reset */}
                        <div className="bg-gray-800 rounded-lg p-6 mt-6">
                            <h2 className="text-xl font-semibold mb-4">Change Password</h2>
                            <form onSubmit={handlePasswordReset} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="Enter new password"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-1">
                                        Confirm Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white focus:ring-2 focus:ring-blue-500"
                                        placeholder="Confirm new password"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors"
                                >
                                    Update Password
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* User's Buttons */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-lg p-6">
                            <h2 className="text-xl font-semibold mb-4">My Sound Buttons</h2>
                            {buttons.length > 0 ? (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                                    {buttons.map((button) => (
                                        <div
                                            key={button.image_id}
                                            className="relative group bg-gray-700 rounded-lg p-3 hover:bg-gray-600 transition-colors"
                                        >
                                            <img
                                                src={`${apiUrlImagesFiles}${button.image_filename}`}
                                                alt={button.button_name}
                                                className="w-full h-20 object-cover rounded mb-2"
                                                loading="lazy"
                                            />
                                            <p className="text-sm font-medium text-center truncate">
                                                {button.button_name}
                                            </p>
                                            <button
                                                onClick={() => handleDeleteButton(button.image_id, button.sound_id || null)}
                                                className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                                                title="Delete button"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-8">
                                    No buttons found. Upload some sounds to get started!
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;