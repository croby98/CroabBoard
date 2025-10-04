import { createFileRoute } from '@tanstack/react-router';
import { usePlayHistory } from '../hooks/usePlayHistory';
import { useRef, useState, useEffect } from 'react';

export const Route = createFileRoute('/history')({
    component: HistoryPage,
});

function HistoryPage() {
    const { history, loading, error, clearHistory, fetchHistory } = usePlayHistory();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [filter, setFilter] = useState<'all' | 'today' | 'week'>('all');
    const [showClearModal, setShowClearModal] = useState(false);

    // Fetch history when component mounts
    useEffect(() => {
        fetchHistory();
    }, []);

    const handlePlay = (soundUrl: string) => {
        if (audioRef.current) {
            // Convert relative URL to absolute URL
            const absoluteUrl = soundUrl.startsWith('http')
                ? soundUrl
                : `http://localhost:5000${soundUrl}`;
            audioRef.current.src = absoluteUrl;
            audioRef.current.play();
        }
    };

    const confirmClearHistory = async () => {
        await clearHistory();
        setShowClearModal(false);
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins} min ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;

        return date.toLocaleDateString('en-US', {
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
        <div className="min-h-screen bg-base-200">
            <div className="container mx-auto px-4 py-8">
                <audio ref={audioRef} />

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-4xl font-bold mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-10 h-10 mr-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Play History
                        </h1>
                        <p className="text-base-content/70">
                            {filteredHistory.length} play{filteredHistory.length !== 1 ? 's' : ''}
                        </p>
                    </div>

                    <div className="flex gap-2">
                        {/* Filter Tabs */}
                        <div className="tabs tabs-boxed">
                            <button
                                className={`tab ${filter === 'all' ? 'tab-active' : ''}`}
                                onClick={() => setFilter('all')}
                            >
                                All
                            </button>
                            <button
                                className={`tab ${filter === 'today' ? 'tab-active' : ''}`}
                                onClick={() => setFilter('today')}
                            >
                                Today
                            </button>
                            <button
                                className={`tab ${filter === 'week' ? 'tab-active' : ''}`}
                                onClick={() => setFilter('week')}
                            >
                                This Week
                            </button>
                        </div>

                        {/* Clear Button */}
                        {history.length > 0 && (
                            <button
                                onClick={() => setShowClearModal(true)}
                                className="btn btn-error btn-outline"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear
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
                            {filter === 'all' ? 'No History' : 'No plays for this period'}
                        </h3>
                        <p className="text-base-content/70">
                            {filter === 'all'
                                ? 'Play sounds to see them appear in your history'
                                : 'Try a different filter'}
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
                                        <img
                                            src={entry.imageUrl?.startsWith('http')
                                                ? entry.imageUrl
                                                : `http://localhost:5000${entry.imageUrl}`
                                            }
                                            alt={entry.button_name}
                                        />
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

            {/* Clear History Confirmation Modal */}
            {showClearModal && (
                <div className="modal modal-open" onClick={() => setShowClearModal(false)}>
                    <div className="modal-box relative" onClick={(e) => e.stopPropagation()}>
                        {/* Close button */}
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => setShowClearModal(false)}
                        >
                            ✕
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-warning/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-warning" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-xl text-center mb-2">Clear History</h3>

                        {/* Message */}
                        <p className="text-center py-4 text-base-content/80">
                            Are you sure you want to clear all history?<br />
                            <span className="text-warning font-semibold mt-2 block">⚠️ This action is irreversible</span>
                        </p>

                        {/* Actions */}
                        <div className="modal-action justify-center gap-3">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setShowClearModal(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={confirmClearHistory}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Clear All
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
