import {createFileRoute, useNavigate} from '@tanstack/react-router';
import React, {useState} from "react";
import { useAuth } from '@/context/AuthContext';

export const Route = createFileRoute('/')({
    component: App,
});

function App() {
    const { login, loading } = useAuth();
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const navigate = useNavigate();

    // Don't auto-redirect during login process - only handle explicit navigation

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (isSubmitting) return;
        
        setErrorMessage(''); // Clear previous errors
        setIsSubmitting(true);
        
        try {
            await login(username, password);
            // Login successful - wait a bit longer to ensure session is saved
            console.log('Login completed, waiting for session to be saved...');
            setTimeout(() => {
                console.log('Attempting navigation to /home');
                try {
                    navigate({ to: '/home', replace: true });
                    console.log('Navigation call completed');
                } catch (navError) {
                    console.error('Navigation error:', navError);
                    // Fallback to window.location
                    window.location.href = '/home';
                }
            }, 500); // Increased delay to ensure session is saved
        } catch (err: any) {
            console.error('Error during login:', err);
            setErrorMessage(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Show loading while checking authentication status
    if (loading) {
        return (
            <div className="flex justify-center flex-grow items-center text-white">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center flex-grow items-center text-white">
            <div className="bg-gray-950 p-8 rounded shadow-md w-full max-w-sm">
                <h1 className="text-2xl font-bold mb-4">Login</h1>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 text-sm font-medium">Username</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
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
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white"
                            placeholder="Enter your password"
                            required
                        />
                    </div>
                    {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 hover:cursor-pointer disabled:bg-gray-500 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Logging in...' : 'Login'}
                    </button>
                </form>
                <p className="mt-4 text-sm text-gray-400 text-center">
                    Enter your username and password to login
                </p>
            </div>
        </div>
    )
}
