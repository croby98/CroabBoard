import React, { useState, useEffect } from 'react';
import { createFileRoute, Link, useNavigate } from '@tanstack/react-router';
import { useAuth } from '@/context/AuthContext';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
'/api'; 

export const Route = createFileRoute('/register')({
    component: App,
});

function App() {
    const { isAuthenticated } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    // Handle redirection for authenticated users
    useEffect(() => {
        if (isAuthenticated) {
            navigate({ to: '/home' });
        }
    }, [isAuthenticated, navigate]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        // Validation
        if (!username || !password || !confirmPassword) {
            setErrorMessage('All fields are required.');
            return;
        }

        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match.');
            return;
        }

        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters long.');
            return;
        }

        if (username.length < 3) {
            setErrorMessage('Username must be at least 3 characters long.');
            return;
        }

        try {
            const response = await fetch(`http://${API_BASE_URL}:5000/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    password,
                    confirmPassword
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                alert('Registration successful! Please login with your new account.');
                navigate({ to: '/' });
            } else {
                setErrorMessage(data.message || 'Registration failed. Please try again.');
            }
        } catch (error: any) {
            setErrorMessage(error.message || 'Network error. Please try again.');
        }
    };

    return (
        <div className="flex justify-center items-center h-screen text-white">
            <div className="bg-gray-950 p-8 rounded shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-4">Register</h1>
                <form onSubmit={handleRegister}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Username</label>
                        <input
                            type="username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2  border rounded"
                            placeholder="Enter your username"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2  border rounded"
                            placeholder="Enter a password"
                            required
                        />
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Confirm Password</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2  border rounded"
                            placeholder="Re-enter your password"
                            required
                        />
                    </div>
                    {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
                    >
                        Register
                    </button>
                </form>
                <p className="mt-4 text-sm text-gray-400">
                    Already have an account?{' '}
                    <Link to="/" className="text-blue-400 hover:underline">
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}