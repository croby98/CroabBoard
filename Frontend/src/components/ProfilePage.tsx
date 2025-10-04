import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

interface UserProfile {
    id: number;
    username: string;
    btn_size: number;
}

interface Button {
    image_id: number;
    uploaded_id: number;
    sound_id?: number | null;
    button_name: string;
    image_filename: string;
    sound_filename?: string | null;
    category_color?: string | null;
}

const ProfilePage: React.FC = () => {
    const { logout, user, updateAvatar } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [username, setUsername] = useState('');
    const [buttons, setButtons] = useState<Button[]>([]);
    const [buttonSize, setButtonSize] = useState(150);
    const [previewSize, setPreviewSize] = useState(150);
    const [sizeInputValue, setSizeInputValue] = useState('150');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [buttonToDelete, setButtonToDelete] = useState<{ imageId: number; soundId: number | null; name: string } | null>(null);
    const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const apiUrlImagesFiles = 'http://localhost:5000/uploads/images/';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        setLoading(true);
        try {
            // Get user info first
            const userResponse = await fetch('http://localhost:5000/api/me', {
                method: 'GET',
                credentials: 'include',
            });
            const userData = await userResponse.json();
            if (userData.success) {
                setUsername(userData.user.username);
            }

            // Get profile data (matches Python Flask /api/profil)
            const profileResponse = await fetch('http://localhost:5000/api/profil', {
                method: 'GET',
                credentials: 'include',
            });
            const profileData = await profileResponse.json();
            
            if (profileResponse.ok && profileData.success) {
                setButtons(profileData.buttons || []);
                const size = profileData.btn_size || 150;
                setButtonSize(size);
                setPreviewSize(size);
                setSizeInputValue(size.toString());
            } else {
                setErrorMessage('Failed to fetch profile data');
            }
        } catch (error: any) {
            console.error('Profile fetch error:', error);
            setErrorMessage(error.message || 'Something went wrong.');
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
                setPreviewSize(newSize);
                setSizeInputValue(newSize.toString());
                setSuccessMessage('Button size updated successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage('Failed to update button size');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to update button size');
        }
    };

    const handlePreviewSizeChange = (newSize: number) => {
        setPreviewSize(newSize);
        setSizeInputValue(newSize.toString());
    };

    const handleSizeInputChange = (value: string) => {
        setSizeInputValue(value);
        const numValue = parseInt(value);
        if (!isNaN(numValue) && numValue >= 50 && numValue <= 300) {
            setPreviewSize(numValue);
        }
    };

    const applySizeChange = () => {
        const newSize = parseInt(sizeInputValue);
        if (!isNaN(newSize) && newSize >= 50 && newSize <= 300) {
            handleButtonSizeChange(newSize);
        } else {
            setErrorMessage('Button size must be between 50 and 300 pixels');
        }
    };

    const handlePasswordReset = async (e: React.FormEvent) => {
        e.preventDefault();

        setErrorMessage('');
        setSuccessMessage('');

        if (!currentPassword) {
            setErrorMessage('Current password is required');
            return;
        }

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
                    currentPassword: currentPassword,
                    newPassword: newPassword,
                    confirmPassword: confirmPassword,
                }),
            });

            const data = await response.json();
            if (response.ok && data.success) {
                setSuccessMessage('Password updated successfully');
                setCurrentPassword('');
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

    const openDeleteModal = (imageId: number, soundId: number | null, name: string) => {
        setButtonToDelete({ imageId, soundId, name });
    };

    const confirmDelete = async () => {
        if (!buttonToDelete) return;

        try {
            // Find the uploaded_id from the button
            const buttonData = buttons.find(b => b.image_id === buttonToDelete.imageId);
            if (!buttonData) {
                setErrorMessage('Button not found');
                setButtonToDelete(null);
                return;
            }

            // Use uploaded_id from the button data to get the correct ID for deletion
            // The Linked table uses uploaded_id, not image_id
            const uploadedIdToDelete = buttonData.uploaded_id || buttonToDelete.imageId;

            const response = await fetch(`http://localhost:5000/api/link/${uploadedIdToDelete}`, {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Filter using uploaded_id instead of image_id
                setButtons(buttons.filter(b => b.uploaded_id !== uploadedIdToDelete));
                setSuccessMessage('Button deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.error || 'Failed to delete button');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete button');
        } finally {
            setButtonToDelete(null);
        }
    };

    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setErrorMessage('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setErrorMessage('Image size must be less than 5MB');
                return;
            }
            setSelectedAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleAvatarUpload = async () => {
        if (!selectedAvatar) return;

        try {
            const formData = new FormData();
            formData.append('avatar', selectedAvatar);

            const response = await fetch('http://localhost:5000/api/user/avatar', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                updateAvatar(data.avatar);
                setSuccessMessage('Avatar updated successfully');
                setSelectedAvatar(null);
                setAvatarPreview(null);
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to upload avatar');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to upload avatar');
        }
    };

    const handleAvatarDelete = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/user/avatar', {
                method: 'DELETE',
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                updateAvatar(null);
                setSuccessMessage('Avatar deleted successfully');
                setTimeout(() => setSuccessMessage(''), 3000);
            } else {
                setErrorMessage(data.message || 'Failed to delete avatar');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Failed to delete avatar');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-base-200">
                <span className="loading loading-spinner loading-lg text-primary"></span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200 p-6">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-4xl font-bold mb-8">User Profile</h1>

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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Profile Info */}
                    <div className="lg:col-span-1">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">Profile Information</h2>

                                {/* Avatar Section */}
                                <div className="flex flex-col items-center space-y-4 py-4">
                                    <div className="avatar">
                                        <div className="w-32 h-32 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                                            {avatarPreview || user?.avatar ? (
                                                <img
                                                    src={avatarPreview || `http://localhost:5000/uploads/avatars/${user?.avatar}`}
                                                    alt="Avatar"
                                                />
                                            ) : (
                                                <div className="bg-base-300 w-full h-full flex items-center justify-center">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                    </svg>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {selectedAvatar ? (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={handleAvatarUpload}
                                                className="btn btn-primary btn-sm"
                                            >
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                </svg>
                                                Upload
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setSelectedAvatar(null);
                                                    setAvatarPreview(null);
                                                }}
                                                className="btn btn-ghost btn-sm"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <label className="btn btn-primary btn-sm">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                Choose Image
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    onChange={handleAvatarSelect}
                                                    className="hidden"
                                                />
                                            </label>
                                            {user?.avatar && (
                                                <button
                                                    onClick={handleAvatarDelete}
                                                    className="btn btn-error btn-sm"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className="divider"></div>

                                <div className="space-y-4">
                                    <div>
                                        <label className="label">
                                            <span className="label-text opacity-70">Username</span>
                                        </label>
                                        <p className="font-medium text-lg">{username}</p>
                                    </div>
                                    <div>
                                        <label className="label">
                                            <span className="label-text opacity-70">Total Uploaded Buttons</span>
                                        </label>
                                        <p className="font-medium text-lg">{buttons.length}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Button Size Settings */}
                        <div className="card bg-base-100 shadow-xl mt-6">
                            <div className="card-body">
                                <h2 className="card-title">Button Size</h2>

                                {/* Live Preview */}
                                <div className="space-y-4">
                                    <div className="bg-base-200 rounded-lg p-6 text-center">
                                        <p className="text-sm opacity-70 mb-3">Live Preview</p>
                                        <div className="flex justify-center items-center">
                                            <div
                                                className="bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg flex items-center justify-center text-white font-bold transition-all duration-300"
                                                style={{
                                                    width: `${previewSize}px`,
                                                    height: `${previewSize}px`,
                                                    fontSize: `${Math.max(12, previewSize / 8)}px`
                                                }}
                                            >
                                                {previewSize}px
                                            </div>
                                        </div>
                                    </div>

                                    {/* Size Controls */}
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <label className="label flex-shrink-0">
                                                <span className="label-text">Size:</span>
                                            </label>
                                            <input
                                                type="number"
                                                min="50"
                                                max="300"
                                                value={sizeInputValue}
                                                onChange={(e) => handleSizeInputChange(e.target.value)}
                                                className="input input-bordered input-sm flex-1"
                                                placeholder="50-300"
                                            />
                                            <span className="text-sm opacity-70">px</span>
                                        </div>

                                        <input
                                            type="range"
                                            min="50"
                                            max="300"
                                            value={previewSize}
                                            onChange={(e) => handlePreviewSizeChange(parseInt(e.target.value))}
                                            className="range range-primary"
                                        />

                                        <div className="flex justify-between text-xs opacity-60">
                                            <span>50px</span>
                                            <span>Current: {buttonSize}px</span>
                                            <span>300px</span>
                                        </div>

                                        {/* Apply Button */}
                                        {previewSize !== buttonSize && (
                                            <div className="pt-2">
                                                <button
                                                    onClick={applySizeChange}
                                                    className="btn btn-primary btn-sm w-full"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    Apply Size Change
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Password Reset */}
                        <div className="card bg-base-100 shadow-xl mt-6">
                            <div className="card-body">
                                <h2 className="card-title">Change Password</h2>
                                <form onSubmit={handlePasswordReset} className="space-y-4">
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Current Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className="input input-bordered w-full"
                                            placeholder="Enter current password"
                                            required
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">New Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="input input-bordered w-full"
                                            placeholder="Enter new password"
                                            required
                                        />
                                    </div>
                                    <div className="form-control">
                                        <label className="label">
                                            <span className="label-text">Confirm New Password</span>
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input input-bordered w-full"
                                            placeholder="Confirm new password"
                                            required
                                        />
                                    </div>
                                    <button
                                        type="submit"
                                        className="btn btn-primary w-full"
                                    >
                                        Update Password
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* User's Buttons */}
                    <div className="lg:col-span-2">
                        <div className="card bg-base-100 shadow-xl">
                            <div className="card-body">
                                <h2 className="card-title">My Sound Buttons</h2>
                                {buttons.length > 0 ? (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
                                        {buttons.map((button) => (
                                            <div
                                                key={button.image_id}
                                                className="relative group card bg-base-200 hover:bg-base-300 transition-all shadow-md"
                                            >
                                                <figure className="px-3 pt-3">
                                                    <img
                                                        src={`${apiUrlImagesFiles}${button.image_filename}`}
                                                        alt={button.button_name}
                                                        className="rounded-lg w-full h-24 object-cover"
                                                        loading="lazy"
                                                    />
                                                </figure>
                                                <div className="card-body p-3">
                                                    <p className="text-sm font-medium text-center truncate">
                                                        {button.button_name}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => openDeleteModal(button.image_id, button.sound_id || null, button.button_name)}
                                                    className="btn btn-circle btn-sm btn-error absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    title="Delete button"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                    </svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-16">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                        </svg>
                                        <p className="opacity-60 text-lg">
                                            No buttons found. Upload some sounds to get started!
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delete Confirmation Modal */}
                {buttonToDelete && (
                    <div className="modal modal-open" onClick={() => setButtonToDelete(null)}>
                        <div className="modal-box relative" onClick={(e) => e.stopPropagation()}>
                            {/* Close button */}
                            <button
                                className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                                onClick={() => setButtonToDelete(null)}
                            >
                                ✕
                            </button>

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                                <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h3 className="font-bold text-xl text-center mb-2">Delete Button</h3>

                            {/* Message */}
                            <p className="text-center py-4 text-base-content/80">
                                Are you sure you want to delete<br />
                                <strong className="text-lg">{buttonToDelete.name}</strong><br />
                                from your collection?
                            </p>

                            {/* Actions */}
                            <div className="modal-action justify-center gap-3">
                                <button
                                    className="btn btn-ghost"
                                    onClick={() => setButtonToDelete(null)}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn btn-error"
                                    onClick={confirmDelete}
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfilePage;