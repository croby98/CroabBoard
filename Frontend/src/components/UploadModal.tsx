import React, { useCallback, useRef, useState } from 'react';

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

    if (!isOpen) return null;

    return (
        <div className="modal modal-open" onClick={handleClose}>
            <div className="modal-box relative max-w-2xl" onClick={(e) => e.stopPropagation()}>
                {/* Close button */}
                <button
                    className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                    onClick={handleClose}
                    disabled={isUploading}
                >
                    ✕
                </button>

                {/* Upload Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-8 h-8 text-primary"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                            />
                        </svg>
                    </div>
                </div>

                {/* Title */}
                <h3 className="font-bold text-xl text-center mb-2">Upload New Sound</h3>
                <p className="text-center text-base-content/70 mb-4">
                    Create a new sound button
                </p>

                {/* Error Message */}
                {errorMessage && (
                    <div className="alert alert-error mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="stroke-current shrink-0 h-6 w-6"
                            fill="none"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <span>{errorMessage}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Button Name */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Button Name *</span>
                        </label>
                        <input
                            type="text"
                            value={buttonName}
                            onChange={(e) => setButtonName(e.target.value)}
                            className="input input-bordered w-full"
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
                        className={`border-2 border-dashed rounded-lg p-6 transition-all ${
                            isDragging
                                ? 'border-primary bg-primary/10'
                                : 'border-base-300 bg-base-200'
                        }`}
                    >
                        <div className="text-center">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="w-12 h-12 mx-auto mb-3 text-base-content/50"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={1.5}
                                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                />
                            </svg>
                            <p className="text-base-content/70 mb-1">
                                Drag and drop image and audio here
                            </p>
                            <p className="text-xs text-base-content/50">
                                Images: png, jpg, gif, webp | Audio: mp3, wav, ogg, m4a
                            </p>
                        </div>
                    </div>

                    {/* File Previews */}
                    {(imageFile || audioFile) && (
                        <div className="grid grid-cols-2 gap-4">
                            {imageFile && (
                                <div className="badge badge-success gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                    {imageFile.name}
                                </div>
                            )}
                            {audioFile && (
                                <div className="badge badge-info gap-2">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                                        />
                                    </svg>
                                    {audioFile.name}
                                </div>
                            )}
                        </div>
                    )}

                    {/* Image Upload */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Image *</span>
                        </label>
                        <input
                            type="file"
                            onChange={(e) => {
                                if (e.target.files) {
                                    assignFilesFromList(e.target.files);
                                }
                            }}
                            className="file-input file-input-bordered w-full"
                            accept="image/*"
                            required
                            disabled={isUploading}
                        />
                    </div>

                    {/* Audio Upload */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Audio *</span>
                        </label>
                        <input
                            type="file"
                            onChange={(e) => {
                                if (e.target.files) {
                                    assignFilesFromList(e.target.files);
                                }
                            }}
                            className="file-input file-input-bordered w-full"
                            accept="audio/*"
                            required
                            disabled={isUploading}
                        />
                    </div>

                    {/* Category */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Category (optional)</span>
                        </label>
                        <input
                            type="text"
                            value={categoryName}
                            onChange={(e) => setCategoryName(e.target.value)}
                            className="input input-bordered w-full"
                            placeholder="Category name"
                            disabled={isUploading}
                        />
                    </div>

                    {/* Action Buttons */}
                    <div className="modal-action justify-center gap-3">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="btn btn-ghost"
                            disabled={isUploading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isUploading}
                        >
                            {isUploading ? (
                                <>
                                    <span className="loading loading-spinner"></span>
                                    Uploading...
                                </>
                            ) : (
                                <>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 mr-1"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                                        />
                                    </svg>
                                    Upload
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UploadModal;