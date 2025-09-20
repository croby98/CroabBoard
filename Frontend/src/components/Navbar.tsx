import React, {useEffect, useState} from 'react';
import { Disclosure, DisclosureButton, DisclosurePanel, Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/context/AuthContext';
import {useLocation, useNavigate} from "@tanstack/react-router";
import UploadModal from './UploadModal';

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export const Navbar: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const { logout } = useAuth(); // Access the `logout` method from AuthContext
    const navigate = useNavigate();

    const location = useLocation(); // Get the current location from React Router
    const [navigation, setNavigation] = useState([
        { name: 'Home', href: '/home', current: false },
        { name: 'Buttons', href: '/buttons', current: false },
        { name: 'Categories', href: '/search', current: false },
        { name: 'Admin', href: '/admin', current: false },
    ]);

    // Update the current state in navigation based on the active path
    useEffect(() => {
        setNavigation((prevNavigation) =>
            prevNavigation.map((item) => ({
                ...item,
                current: item.href === location.pathname, // Compare an item's `href` with the current pathname
            }))
        );
    }, [location.pathname]); // Run whenever the route changes



    const handleLogout = async () => {
        try {
            // Call your API to clear the session
            const response = await fetch('http://localhost:5000/api/logout', {
                method: 'POST',
                credentials: 'include', // Include cookies
            });

            if (response.ok) {
                logout(); // Clear the authentication state
                await navigate({to: '/'}); // Redirect to the login page
            } else {
                console.error('Failed to log out.');
            }
        } catch (err) {
            console.error('Error during logout:', err);
        }
    };

    return (
        <>
            <Disclosure as="nav" className="flex justify-center">
                <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
                    <div className="relative flex h-16 items-center justify-between">
                        <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                            {/* Mobile menu button*/}
                            <DisclosureButton className="group relative inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:ring-2 focus:ring-white focus:outline-hidden focus:ring-inset">
                                <span className="absolute -inset-0.5" />
                                <span className="sr-only">Open main menu</span>
                                <Bars3Icon aria-hidden="true" className="block size-6 group-data-open:hidden" />
                                <XMarkIcon aria-hidden="true" className="hidden size-6 group-data-open:block" />
                            </DisclosureButton>
                        </div>
                        <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                            <div className="hidden sm:ml-6 sm:block">
                                <div className="flex space-x-4">
                                    {navigation.map((item) => (
                                        <a
                                            key={item.name}
                                            href={item.href}
                                            aria-current={item.current ? 'page' : undefined}
                                            className={classNames(
                                                item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                                'rounded-md px-3 py-2 text-sm font-medium',
                                            )}
                                        >
                                            {item.name}
                                        </a>
                                    ))}
                                </div>
                            </div>
                            <div className="ps-4">
                                <button
                                    onClick={openModal}
                                    className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 cursor-pointer"
                                >
                                    Upload
                                </button>

                                {/* Upload Modal */}
                                <UploadModal isOpen={isModalOpen} closeModal={closeModal} />
                            </div>
                        </div>
                        <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                            {/* Profile dropdown */}
                            <Menu as="div" className="relative ml-3">
                                <div>
                                    <MenuButton className="relative flex rounded-full bg-gray-800 text-sm focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800 focus:outline-hidden cursor-pointer">
                                        <span className="absolute -inset-1.5" />
                                        <span className="sr-only">Open user menu</span>
                                        <img
                                            alt=""
                                            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                            className="size-8 rounded-full"
                                        />
                                    </MenuButton>
                                </div>
                                <MenuItems
                                    transition
                                    className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-gray-950 py-1 shadow-lg ring-1 ring-black/5 transition focus:outline-hidden data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                                >
                                    <MenuItem>
                                        <a
                                            href="/profile"
                                            className="block px-4 py-2 text-sm w-full text-center text-gray-100 data-focus:bg-gray-900 data-focus:outline-hidden"
                                        >
                                            Profile
                                        </a>
                                    </MenuItem>
                                    <MenuItem>
                                        <button
                                            onClick={handleLogout}
                                            className="block px-4 py-2 text-sm w-full text-gray-100 data-focus:bg-gray-900 data-focus:outline-hidden hover:cursor-pointer"
                                        >
                                            Sign out
                                        </button>
                                    </MenuItem>
                                </MenuItems>
                            </Menu>
                        </div>
                    </div>
                </div>

                <DisclosurePanel className="sm:hidden">
                    <div className="space-y-1 px-2 pt-2 pb-3">
                        {navigation.map((item) => (
                            <DisclosureButton
                                key={item.name}
                                as="a"
                                href={item.href}
                                aria-current={item.current ? 'page' : undefined}
                                className={classNames(
                                    item.current ? 'bg-gray-900 text-white' : 'text-gray-300 hover:bg-gray-700 hover:text-white',
                                    'block rounded-md px-3 py-2 text-base font-medium',
                                )}
                            >
                                {item.name}
                            </DisclosureButton>
                        ))}
                    </div>
                </DisclosurePanel>
            </Disclosure>
        </>
    );
};

export default Navbar;