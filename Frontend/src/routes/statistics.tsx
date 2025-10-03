import { createFileRoute } from '@tanstack/react-router';
import { useState, useEffect, useRef } from 'react';

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
            const response = await fetch(`http://localhost:5000/api/stats/most-played?limit=${limit}`, {
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
            audioRef.current.src = soundUrl;
            audioRef.current.play();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <audio ref={audioRef} />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-10 h-10 mr-3 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        Statistiques
                    </h1>
                    <p className="text-base-content/70">Les sons les plus populaires</p>
                </div>

                {/* Limit Selector */}
                <select
                    value={limit}
                    onChange={(e) => setLimit(Number(e.target.value))}
                    className="select select-bordered"
                >
                    <option value={10}>Top 10</option>
                    <option value={20}>Top 20</option>
                    <option value={50}>Top 50</option>
                    <option value={100}>Top 100</option>
                </select>
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
                    <h3 className="text-2xl font-semibold mb-2">Aucune statistique</h3>
                    <p className="text-base-content/70">Les statistiques apparaîtront lorsque des sons seront joués</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {mostPlayed.map((button, index) => (
                        <div
                            key={button.id}
                            className="card bg-base-200 hover:bg-base-300 transition-all duration-200 cursor-pointer"
                            onClick={() => handlePlay(button.soundUrl)}
                            style={{
                                borderLeft: button.category_color
                                    ? `4px solid ${button.category_color}`
                                    : undefined,
                            }}
                        >
                            <div className="card-body p-4 flex-row items-center gap-4">
                                {/* Rank */}
                                <div className="flex-shrink-0 w-12 text-center">
                                    {index < 3 ? (
                                        <div className="text-3xl font-bold">
                                            {index === 0 && '🥇'}
                                            {index === 1 && '🥈'}
                                            {index === 2 && '🥉'}
                                        </div>
                                    ) : (
                                        <div className="text-2xl font-bold text-base-content/50">
                                            #{index + 1}
                                        </div>
                                    )}
                                </div>

                                {/* Image */}
                                <div className="avatar">
                                    <div className="w-20 h-20 rounded-lg">
                                        <img src={button.imageUrl} alt={button.button_name} />
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
                                        <span>Dernière lecture: {formatDate(button.last_played)}</span>
                                    </div>
                                </div>

                                {/* Play Count */}
                                <div className="text-right">
                                    <div className="text-3xl font-bold text-primary">{button.play_count}</div>
                                    <div className="text-sm text-base-content/70">lectures</div>
                                </div>

                                {/* Play Button */}
                                <button className="btn btn-circle btn-primary">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
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
                <div className="stats stats-vertical lg:stats-horizontal shadow mt-8 w-full">
                    <div className="stat">
                        <div className="stat-title">Total de lectures</div>
                        <div className="stat-value text-primary">
                            {mostPlayed.reduce((sum, b) => sum + b.play_count, 0).toLocaleString()}
                        </div>
                        <div className="stat-desc">Pour les {mostPlayed.length} sons affichés</div>
                    </div>

                    <div className="stat">
                        <div className="stat-title">Son le plus populaire</div>
                        <div className="stat-value text-secondary">{mostPlayed[0].play_count}</div>
                        <div className="stat-desc">{mostPlayed[0].button_name}</div>
                    </div>

                    <div className="stat">
                        <div className="stat-title">Moyenne de lectures</div>
                        <div className="stat-value text-accent">
                            {Math.round(mostPlayed.reduce((sum, b) => sum + b.play_count, 0) / mostPlayed.length)}
                        </div>
                        <div className="stat-desc">Par son</div>
                    </div>
                </div>
            )}
        </div>
    );
}
