import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment, useCallback, useRef, useState } from 'react';

interface UploadModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, closeModal }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [buttonName, setButtonName] = useState('');
    const [categoryName, setCategoryName] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const dropRef = useRef<HTMLDivElement | null>(null);

    const assignFilesFromList = useCallback((files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const image = fileArray.find((f) => f.type.startsWith('image/')) || null;
        const audio = fileArray.find((f) => f.type.startsWith('audio/')) || null;
        if (image) setImageFile(image);
        if (audio) setAudioFile(audio);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (dropRef.current && !dropRef.current.contains(e.relatedTarget as Node)) {
            setIsDragging(false);
        }
    }, []);

    const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
            assignFilesFromList(e.dataTransfer.files);
            e.dataTransfer.clearData();
        }
    }, [assignFilesFromList]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!imageFile || !audioFile || !buttonName) {
            setErrorMessage('Please fill in all required fields');
            return;
        }

        setIsUploading(true);
        setErrorMessage('');

        try {
            const formData = new FormData();
            formData.append('image', imageFile);
            formData.append('sound', audioFile);
            formData.append('ButtonName', buttonName);
            if (categoryName) {
                formData.append('CategoryName', categoryName);
            }

            const response = await fetch('http://localhost:5000/api/buttons', {
                method: 'POST',
                credentials: 'include',
                body: formData,
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Reset form
                setImageFile(null);
                setAudioFile(null);
                setButtonName('');
                setCategoryName('');
                closeModal();
                // Optionally refresh the page or emit an event to refresh button lists
                window.location.reload();
            } else {
                setErrorMessage(data.message || 'Upload failed');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Upload failed');
        } finally {
            setIsUploading(false);
        }
    };

    const handleClose = () => {
        if (!isUploading) {
            setImageFile(null);
            setAudioFile(null);
            setButtonName('');
            setCategoryName('');
            setErrorMessage('');
            closeModal();
        }
    };

    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={handleClose} className="relative z-50">
                {/* Backdrop */}
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-30" />
                </Transition.Child>

                {/* Modal Content */}
                <div className="fixed inset-0 flex items-center justify-center p-4">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md bg-gray-800 p-6 rounded-lg shadow-lg">
                            <Dialog.Title className="text-lg font-medium text-gray-100 mb-2">
                                Upload New Sound Button
                            </Dialog.Title>
                            <Dialog.Description className="text-sm text-gray-400 mb-4">
                                Create a new sound button by uploading an image and audio file.
                            </Dialog.Description>

                            {errorMessage && (
                                <div className="mb-4 p-3 bg-red-900 border border-red-700 rounded text-red-100 text-sm">
                                    {errorMessage}
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Button Name */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-100 mb-1">
                                        Button Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        value={buttonName}
                                        onChange={(e) => setButtonName(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter button name"
                                        required
                                        disabled={isUploading}
                                    />
                                </div>

                                {/* Drag & Drop Zone */}
                                <div
                                    ref={dropRef}
                                    onDragOver={onDragOver}
                                    onDragLeave={onDragLeave}
                                    onDrop={onDrop}
                                    className={`border-2 border-dashed rounded p-4 transition-colors ${
                                        isDragging ? 'border-blue-500 bg-blue-500/10' : 'border-gray-600 bg-gray-700/30'
                                    }`}
                                >
                                    <p className="text-gray-300 text-sm mb-2">
                                        Glissez-déposez une image et un audio ici, ou utilisez les champs ci-dessous.
                                    </p>
                                    <div className="text-xs text-gray-400">Types supportés: images (png, jpg, gif, webp), audio (mp3, wav, ogg, m4a)</div>
                                </div>

                                {/* Image Upload */}
                                <div>
                                    <label htmlFor="image" className="block text-sm font-medium text-gray-100 mb-1">
                                        Image File *
                                    </label>
                                    <input
                                        type="file"
                                        id="image"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                assignFilesFromList(e.target.files);
                                            }
                                        }}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600 cursor-pointer"
                                        accept="image/*"
                                        required
                                        disabled={isUploading}
                                    />
                                </div>

                                {/* Audio Upload */}
                                <div>
                                    <label htmlFor="audio" className="block text-sm font-medium text-gray-100 mb-1">
                                        Audio File *
                                    </label>
                                    <input
                                        type="file"
                                        id="audio"
                                        onChange={(e) => {
                                            if (e.target.files) {
                                                assignFilesFromList(e.target.files);
                                            }
                                        }}
                                        className="w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-700 file:text-gray-100 hover:file:bg-gray-600 cursor-pointer"
                                        accept="audio/*"
                                        required
                                        disabled={isUploading}
                                    />
                                </div>

                                {/* Category */}
                                <div>
                                    <label htmlFor="category" className="block text-sm font-medium text-gray-100 mb-1">
                                        Category (Optional)
                                    </label>
                                    <input
                                        type="text"
                                        id="category"
                                        value={categoryName}
                                        onChange={(e) => setCategoryName(e.target.value)}
                                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="Enter category name"
                                        disabled={isUploading}
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex justify-end space-x-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleClose}
                                        className="px-4 py-2 text-sm text-gray-300 bg-gray-700 rounded hover:bg-gray-600 transition-colors disabled:opacity-50"
                                        disabled={isUploading}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        disabled={isUploading}
                                    >
                                        {isUploading ? 'Uploading...' : 'Upload'}
                                    </button>
                                </div>
                            </form>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UploadModal;