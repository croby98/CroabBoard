import { createFileRoute } from '@tanstack/react-router';
import { usePlayHistory } from '../hooks/usePlayHistory';
import { useRef, useState } from 'react';

export const Route = createFileRoute('/history')({
    component: HistoryPage,
});

function HistoryPage() {
    const { history, loading, error, clearHistory } = usePlayHistory();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');

    const handlePlay = (soundUrl: string) => {
        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.play();
        }
    };

    const handleClearHistory = async () => {
        if (confirm('Êtes-vous sûr de vouloir effacer tout l\'historique ?')) {
            await clearHistory();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'short',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
        });
    };

    const filteredHistory = history.filter((entry) => {
        if (filter === 'all') return true;

        const playedDate = new Date(entry.played_at);
        const now = new Date();

        if (filter === 'today') {
            return playedDate.toDateString() === now.toDateString();
        }

        if (filter === 'week') {
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return playedDate >= weekAgo;
        }

        return true;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="loading loading-spinner loading-lg"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-error max-w-2xl mx-auto mt-8">
                <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <audio ref={audioRef} />

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-4xl font-bold mb-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-10 h-10 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Historique
                    </h1>
                    <p className="text-base-content/70">
                        {filteredHistory.length} lecture{filteredHistory.length !== 1 ? 's' : ''}
                    </p>
                </div>

                <div className="flex gap-2">
                    {/* Filter Tabs */}
                    <div className="tabs tabs-boxed">
                        <button
                            className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                            onClick={() => setFilter('all')}
                        >
                            Tout
                        </button>
                        <button
                            className={`tab ${filter === 'today' ? 'tab-active' : ''}`}
                            onClick={() => setFilter('today')}
                        >
                            Aujourd'hui
                        </button>
                        <button
                            className={`tab ${filter === 'week' ? 'tab-active' : ''}`}
                            onClick={() => setFilter('week')}
                        >
                            Cette semaine
                        </button>
                    </div>

                    {/* Clear Button */}
                    {history.length > 0 && (
                        <button
                            onClick={handleClearHistory}
                            className="btn btn-error btn-outline"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                            Effacer
                        </button>
                    )}
                </div>
            </div>

            {/* History List */}
            {filteredHistory.length === 0 ? (
                <div className="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-2xl font-semibold mb-2">
                        {filter === 'all' ? 'Aucun historique' : 'Aucune lecture pour cette période'}
                    </h3>
                    <p className="text-base-content/70">
                        {filter === 'all'
                            ? 'Jouez des sons pour les voir apparaître dans votre historique'
                            : 'Essayez un autre filtre'}
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filteredHistory.map((entry, index) => (
                        <div
                            key={`${entry.id}-${index}`}
                            className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                            onClick={() => handlePlay(entry.soundUrl)}
                            style={{
                                borderLeft: entry.category_color
                                    ? `4px solid ${entry.category_color}`
                                    : undefined,
                            }}
                        >
                            <div className="card-body p-4 flex-row items-center gap-4">
                                {/* Image */}
                                <div className="avatar">
                                    <div className="w-16 h-16 rounded-lg">
                                        <img src={entry.imageUrl} alt={entry.button_name} />
                                    </div>
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold truncate">{entry.button_name}</h3>
                                    <div className="flex gap-3 text-sm text-base-content/70">
                                        {entry.category_name && (
                                            <span className="badge badge-sm badge-ghost">
                                                {entry.category_name}
                                            </span>
                                        )}
                                        <span>{formatDate(entry.played_at)}</span>
                                    </div>
                                </div>

                                {/* Play Icon */}
                                <button className="btn btn-circle btn-ghost">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
