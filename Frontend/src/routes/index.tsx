import {createFileRoute, Link, useNavigate} from '@tanstack/react-router';
import React, {useState} from "react";
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/')({
    component: App,
});

function App() {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('http://localhost:5000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    username,
                    password,
                }),
                credentials: 'include',
            });

            const data = await response.json();

            if (response.ok && data.success) {
                login(); // Call login from the AuthContext to set the authentication state
                navigate({ to: '/home' }); // Redirect to /home page
            } else {
                setErrorMessage(data.message || 'Login failed. Please try again.');
            }
        } catch (err) {
            console.error('Error during login:', err);
            setErrorMessage('There was a problem logging in. Please try again.');
        }

    };
    return (
        <div className="flex justify-center flex-grow items-center text-white">
            <div className="bg-gray-950 p-8 rounded shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <form onSubmit={handleLogin}>
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
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600  hover:cursor-pointer"
                    >
                        Login
                    </button>
                </form>
                <p className="mt-4 text-sm text-gray-400">
                    Don't have an account?{' '}
                    <Link
                        // @ts-ignore
                        to="/register"
                        className="text-blue-400 hover:underline hover:cursor-pointer"
                    >
                        Register here
                    </Link>
                </p>
            </div>
        </div>
    )
}
