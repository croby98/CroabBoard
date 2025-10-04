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
            <div className="hero min-h-screen bg-base-200">
                <div className="hero-content text-center">
                    <div>
                        <span className="loading loading-spinner loading-lg text-primary"></span>
                        <p className="mt-4">Loading...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="hero min-h-screen bg-gradient-to-br from-primary/10 to-secondary/10">
            <div className="hero-content flex-col lg:flex-row-reverse">
                <div className="text-center lg:text-left lg:ml-8">
                    <div className="flex items-center justify-center lg:justify-start mb-4">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mr-4">
                            <img className="w-10 h-10" src="/favicon.ico" alt="CroabBoard" />
                        </div>
                        <div>
                            <h1 className="text-5xl font-bold text-base-content">CroabBoard</h1>
                            <p className="text-lg text-base-content/70">Sound Collection Manager</p>
                        </div>
                    </div>
                    <p className="py-6 text-base-content/60 max-w-md">
                        Your professional sound button collection. Upload, organize, and play your favorite sounds with an intuitive interface and powerful features.
                    </p>
                </div>
                
                <div className="card flex-shrink-0 w-full max-w-md shadow-2xl bg-base-100">
                    <div className="card-body">
                        <h2 className="card-title justify-center text-2xl mb-6">Welcome Back</h2>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Username</span>
                                </label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="input input-bordered input-primary w-full"
                                    placeholder="Enter your username"
                                    required
                                />
                            </div>
                            
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Password</span>
                                </label>
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="input input-bordered input-primary w-full"
                                    placeholder="Enter your password"
                                    required
                                />
                            </div>
                            
                            {errorMessage && (
                                <div className="alert alert-error">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>{errorMessage}</span>
                                </div>
                            )}
                            
                            <div className="form-control mt-6">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className={`btn btn-primary w-full ${isSubmitting ? 'loading' : ''}`}
                                >
                                    {isSubmitting ? 'Signing in...' : 'Sign In'}
                                </button>
                            </div>
                        </form>
                        
                        <div className="divider">New to CroabBoard?</div>
                        
                        <a href="/register" className="btn btn-outline w-full">
                            Create Account
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
