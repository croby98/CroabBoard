import { Dialog, Transition } from '@headlessui/react';
import React, { Fragment } from 'react';

interface UploadModalProps {
    isOpen: boolean;
    closeModal: () => void;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, closeModal }) => {
    return (
        <Transition show={isOpen} as={Fragment}>
            <Dialog onClose={closeModal} className="relative z-50">
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
                <div className="fixed inset-0 flex items-center justify-center">
                    <Transition.Child
                        as={Fragment}
                        enter="ease-out duration-300"
                        enterFrom="opacity-0 scale-95"
                        enterTo="opacity-100 scale-100"
                        leave="ease-in duration-200"
                        leaveFrom="opacity-100 scale-100"
                        leaveTo="opacity-0 scale-95"
                    >
                        <Dialog.Panel className="w-full max-w-md bg-gray-800 p-4 rounded-lg shadow-lg">
                            <Dialog.Title className="text-lg font-medium text-gray-400">
                                Upload File
                            </Dialog.Title>
                            <Dialog.Description className="mt-2 text-sm text-gray-500">
                                Please select a file to upload.
                            </Dialog.Description>

                            {/* File Input */}
                            <div className="flex gap-1 mt-4">
                                <label htmlFor="image" className="text-gray-100">Image :</label>
                                <input
                                    type="file"
                                    id="image"
                                    name="image"
                                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-950 file:text-gray-100 hover:file:bg-gray-900  cursor-pointer"
                                    accept="image/png"
                                />
                            </div>
                            <div className="flex gap-1 mt-4">
                                <label htmlFor="audio" className="text-gray-100">Audio :</label>
                                <input
                                    type="file"
                                    id="audio"
                                    name="audio"
                                    className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-gray-950 file:text-gray-100 hover:file:bg-gray-900  cursor-pointer"
                                    accept="audio/mp3"
                                />
                            </div>
                            <div className="flex gap-1 mt-4">
                                <label htmlFor="name" className="text-gray-100">Name :</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    className="input"
                                />
                            </div>
                            <div className="flex gap-1 mt-4">
                                <label htmlFor="category" className="text-gray-100">Category :</label>
                                <select name="category" id="category">
                                    <option value="">test</option>
                                    <option value="">test</option>
                                </select>
                            </div>




                            {/* Action Buttons */}
                            <div className="mt-4 flex justify-end space-x-2">
                                <button
                                    onClick={closeModal}
                                    className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded hover:bg-gray-200 cursor-pointer"
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 text-sm text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
                                >
                                    Upload
                                </button>
                            </div>
                        </Dialog.Panel>
                    </Transition.Child>
                </div>
            </Dialog>
        </Transition>
    );
};

export default UploadModal;