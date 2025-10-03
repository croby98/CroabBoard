import React, {useEffect, useState} from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {useLocation, useNavigate} from "@tanstack/react-router";
import UploadModal from './UploadModal';
import ThemeSelector from './ui/ThemeSelector';

export const Navbar: React.FC = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    const { user, logout } = useAuth(); // Access the `logout` method from AuthContext
    const { theme, toggleTheme } = useTheme(); // Access theme methods
    const navigate = useNavigate();

    const location = useLocation(); // Get the current location from React Router
    const [navigation, setNavigation] = useState([
        { name: 'Home', href: '/home', current: false },
        { name: 'Buttons', href: '/buttons', current: false },
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
            <div className="navbar bg-base-100 shadow-lg border-b border-base-300">
                <div className="navbar-start">
                    {/* Mobile menu */}
                    <div className="dropdown">
                        <div tabIndex={0} role="button" className="btn btn-ghost btn-circle lg:hidden">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h8m-8 6h16" />
                            </svg>
                        </div>
                        <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-box w-64 border border-base-300">
                            {navigation.map((item) => (
                                <li key={item.name}>
                                    <a href={item.href} className={`flex items-center gap-2 ${item.current ? 'active' : ''}`}>
                                        <span className="w-2 h-2 rounded-full bg-primary opacity-60"></span>
                                        {item.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                    
                    {/* Logo */}
                    <a href="/home" className="btn btn-ghost text-xl font-bold">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                                <span className="text-base-100 text-lg">🎵</span>
                            </div>
                            <span className="hidden sm:inline">CroabBoard</span>
                        </div>
                    </a>
                </div>
                
                {/* Desktop menu */}
                <div className="navbar-center hidden lg:flex">
                    <ul className="menu menu-horizontal px-1">
                        {navigation.map((item) => (
                            <li key={item.name}>
                                <a href={item.href} className={`font-medium ${item.current ? 'active' : ''}`}>
                                    {item.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
                
                {/* Actions */}
                <div className="navbar-end">
                    <div className="flex items-center gap-2">
                        {/* Upload button */}
                        <button
                            onClick={openModal}
                            className="btn btn-primary btn-sm gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span className="hidden sm:inline">Upload</span>
                        </button>

                        {/* Theme Selector */}
                        <ThemeSelector />
                        
                        {/* Profile dropdown */}
                        <div className="dropdown dropdown-end">
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-10 rounded-full ring-2 ring-base-300 ring-offset-base-100 ring-offset-2">
                                    <img
                                        alt={user?.username || 'User'}
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        className="rounded-full"
                                    />
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow-xl bg-base-100 rounded-box w-64 border border-base-300">
                                <li>
                                    <a href="/profile" className="flex items-center gap-3">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Profile Settings
                                    </a>
                                </li>
                                {user?.username === 'Croby' && (
                                    <li>
                                        <a href="/admin" className="flex items-center gap-3">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            Admin Panel
                                        </a>
                                    </li>
                                )}
                                <div className="divider my-2"></div>
                                <li>
                                    <a onClick={handleLogout} className="flex items-center gap-3 text-error">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Sign out
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upload Modal */}
            <UploadModal isOpen={isModalOpen} closeModal={closeModal} />
        </>
    );
};

export default Navbar;