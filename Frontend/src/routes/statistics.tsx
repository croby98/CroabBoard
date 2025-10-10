import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';
const API_BASE_URL = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
'/api'; 

export const Route = createFileRoute('/statistics')({
    component: StatisticsPage,
});

interface MostPlayedButton {
    id: number;
    button_name: string;
    image_filename: string;
    sound_filename: string;
    imageUrl: string;
    soundUrl: string;
    category_name?: string;
    category_color?: string;
    play_count: number;
    last_played: string;
}

function StatisticsPage() {
    const [mostPlayed, setMostPlayed] = useState<MostPlayedButton[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(20);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        fetchMostPlayed();
    }, [limit]);

    const fetchMostPlayed = async () => {
        setLoading(true);
        try {
            const response = await fetch(`http://${API_BASE_URL}:5000/api/stats/most-played?limit=${limit}`, {
                credentials: 'include',
            });
            const data = await response.json();

            if (data.success) {
                setMostPlayed(data.mostPlayed);
            }
        } catch (err) {
            console.error('Error fetching most played:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePlay = (soundUrl: string) => {
        if (audioRef.current) {
            // Convert relative URL to absolute URL
            const absoluteUrl = soundUrl?.startsWith('http')
                ? soundUrl
                : `http://${API_BASE_URL}:5000${soundUrl}`;
            audioRef.current.src = absoluteUrl;
            audioRef.current.play();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto px-4 py-8">
                <audio ref={audioRef} />

                {/* Header */}
                <div className="hero bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-3xl mb-8">
                    <div className="hero-content text-center">
                        <div className="max-w-2xl">
                            <div className="text-6xl mb-4">📊</div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
                                Statistics
                            </h1>
                            <p className="py-6 text-lg">
                                Discover your most played sounds and listening patterns
                            </p>
                            <div className="flex justify-center gap-4">
                                <select
                                    value={limit}
                                    onChange={(e) => setLimit(Number(e.target.value))}
                                    className="select select-bordered select-lg bg-white/50 backdrop-blur-sm"
                                >
                                    <option value={10}>🏆 Top 10</option>
                                    <option value={20}>🎯 Top 20</option>
                                    <option value={50}>🚀 Top 50</option>
                                    <option value={100}>💎 Top 100</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

            {loading ? (
                <div className="flex items-center justify-center py-16">
                    <div className="loading loading-spinner loading-lg"></div>
                </div>
                ) : mostPlayed.length === 0 ? (
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <h3 className="text-2xl font-semibold mb-2">No Statistics</h3>
                        <p className="text-base-content/70">Statistics will appear once sounds are played</p>
                    </div>
            ) : (
                <div className="space-y-4">
                    {mostPlayed.map((button, index) => (
                        <div
                            key={button.id}
                            className="card bg-base-100 shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 cursor-pointer border-2 border-transparent hover:border-purple-200"
                            onClick={() => handlePlay(button.soundUrl)}
                            style={{
                                borderLeft: button.category_color
                                    ? `6px solid ${button.category_color}`
                                    : '6px solid #8b5cf6',
                            }}
                        >
                            <div className="card-body p-4 flex-row items-center gap-4">
                                {/* Rank */}
                                <div className="flex-shrink-0 w-16 text-center">
                                    {index < 3 ? (
                                        <div className="relative">
                                            <div className="text-4xl mb-1">
                                                {index === 0 && '🥇'}
                                                {index === 1 && '🥈'}
                                                {index === 2 && '🥉'}
                                            </div>
                                            <div className="text-xs font-bold text-accent">
                                                #{index + 1}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="w-12 h-12 mx-auto bg-gradient-to-br from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {index + 1}
                                        </div>
                                    )}
                                </div>

                                {/* Image */}
                                <div className="avatar">
                                    <div className="w-24 h-24 rounded-xl shadow-lg ring-2 ring-purple-200 ring-offset-2">
                                        <img
                                            src={button.imageUrl?.startsWith('http')
                                                ? button.imageUrl
                                                : `http://${API_BASE_URL}:5000${button.imageUrl}`
                                            }
                                            alt={button.button_name}
                                            className="object-cover w-full h-full rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-lg truncate">{button.button_name}</h3>
                                    <div className="flex flex-wrap gap-3 text-sm text-base-content/70 mt-1">
                                        {button.category_name && (
                                            <span className="badge badge-sm badge-ghost">
                                                {button.category_name}
                                            </span>
                                        )}
                                        <span>Last played: {formatDate(button.last_played)}</span>
                                    </div>
                                </div>

                                {/* Play Count */}
                                <div className="text-right">
                                    <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-2xl px-4 py-2 shadow-lg">
                                        <div className="text-3xl font-bold">{button.play_count.toLocaleString()}</div>
                                        <div className="text-sm opacity-90">plays</div>
                                    </div>
                                </div>

                                {/* Play Button */}
                                <button className="btn btn-circle btn-lg bg-gradient-to-r from-purple-500 to-blue-500 border-none hover:from-purple-600 hover:to-blue-600 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

                {/* Summary Stats */}
                {mostPlayed.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                        <div className="stat bg-gradient-to-br from-blue-500 to-cyan-500 text-white rounded-2xl shadow-xl p-6">
                            <div className="stat-figure text-white/70">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="stat-title text-white/80">Total Plays</div>
                            <div className="stat-value text-white text-4xl">
                                {mostPlayed.reduce((sum, b) => sum + b.play_count, 0).toLocaleString()}
                            </div>
                            <div className="stat-desc text-white/70">For {mostPlayed.length} sounds shown</div>
                        </div>

                        <div className="stat bg-gradient-to-br from-purple-500 to-pink-500 text-white rounded-2xl shadow-xl p-6">
                            <div className="stat-figure text-white/70">
                                <div className="text-3xl">🏆</div>
                            </div>
                            <div className="stat-title text-white/80">Most Popular</div>
                            <div className="stat-value text-white text-4xl">{mostPlayed[0].play_count.toLocaleString()}</div>
                            <div className="stat-desc text-white/70 truncate">{mostPlayed[0].button_name}</div>
                        </div>

                        <div className="stat bg-gradient-to-br from-green-500 to-teal-500 text-white rounded-2xl shadow-xl p-6">
                            <div className="stat-figure text-white/70">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            </div>
                            <div className="stat-title text-white/80">Average Plays</div>
                            <div className="stat-value text-white text-4xl">
                                {Math.round(mostPlayed.reduce((sum, b) => sum + b.play_count, 0) / mostPlayed.length).toLocaleString()}
                            </div>
                            <div className="stat-desc text-white/70">Per sound</div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
