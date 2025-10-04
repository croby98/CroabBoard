import { createFileRoute } from '@tanstack/react-router';
import { useFavorites } from '../hooks/useFavorites';
import { usePlayHistory } from '../hooks/usePlayHistory';
import { useRef, useState } from 'react';

export const Route = createFileRoute('/favorites')({
    component: FavoritesPage,
});

function FavoritesPage() {
    const { favorites, loading, error, removeFavorite } = useFavorites();
    const { recordPlay } = usePlayHistory();
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [itemToRemove, setItemToRemove] = useState<{ id: number; name: string } | null>(null);

    const handlePlay = async (soundUrl: string, uploadedId: number) => {
        if (audioRef.current) {
            // Convert relative URL to absolute URL
            const absoluteUrl = soundUrl?.startsWith('http')
                ? soundUrl
                : `http://localhost:5000${soundUrl}`;
            audioRef.current.src = absoluteUrl;
            audioRef.current.play();
            await recordPlay(uploadedId);
        }
    };

    const openRemoveModal = (uploadedId: number, buttonName: string) => {
        setItemToRemove({ id: uploadedId, name: buttonName });
    };

    const confirmRemove = async () => {
        if (itemToRemove) {
            await removeFavorite(itemToRemove.id);
            setItemToRemove(null);
        }
    };

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
                <div className="hero bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-3xl mb-8">
                    <div className="hero-content text-center">
                        <div className="max-w-md">
                            <div className="text-6xl mb-4">❤️</div>
                            <h1 className="text-5xl font-bold bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent">
                                My Favorites
                            </h1>
                            <p className="py-6 text-lg">
                                {favorites.length} favorite sound{favorites.length !== 1 ? 's' : ''} ready to play
                            </p>
                            <div className="stats shadow">
                                <div className="stat">
                                    <div className="stat-figure text-red-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="inline-block w-8 h-8 stroke-current">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
                                        </svg>
                                    </div>
                                    <div className="stat-title">Total Favorites</div>
                                    <div className="stat-value text-red-500">{favorites.length}</div>
                                    <div className="stat-desc">Sounds you love</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Favorites Grid */}
                {favorites.length === 0 ? (
                    <div className="text-center py-16">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                        <h3 className="text-2xl font-semibold mb-2">No Favorites</h3>
                        <p className="text-base-content/70 mb-4">
                            Add sounds to your favorites to easily find them here
                        </p>
                        <a href="/home" className="btn btn-primary">
                            Browse Sounds
                        </a>
                    </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                    {favorites.map((favorite) => (
                        <div
                            key={favorite.id}
                            className="card bg-base-100 shadow-xl hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 cursor-pointer group border-2 border-transparent hover:border-red-200"
                            style={{
                                borderLeft: favorite.category_color
                                    ? `6px solid ${favorite.category_color}`
                                    : '6px solid #ef4444',
                            }}
                        >
                            <div className="card-body p-3">
                                {/* Image */}
                                <div
                                    className="aspect-square rounded-xl overflow-hidden mb-3 relative shadow-lg"
                                    onClick={() => handlePlay(favorite.soundUrl, favorite.id)}
                                >
                                    <img
                                        src={favorite.imageUrl?.startsWith('http')
                                            ? favorite.imageUrl
                                            : `http://localhost:5000${favorite.imageUrl}`
                                        }
                                        alt={favorite.button_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-16 h-16 bg-red-500/80 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-50 group-hover:scale-100">
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-8 h-8 text-white ml-1"
                                                fill="currentColor"
                                                viewBox="0 0 24 24"
                                            >
                                                <path d="M8 5v14l11-7z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="absolute top-2 right-2">
                                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                                            <span className="text-white text-xs">❤️</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <h3 className="font-bold text-base text-center mb-2" title={favorite.button_name}>
                                    {favorite.button_name}
                                </h3>

                                {/* Category */}
                                {favorite.category_name && (
                                    <div className="flex justify-center mb-2">
                                        <span
                                            className="badge badge-sm text-white font-medium"
                                            style={{ backgroundColor: favorite.category_color || '#ef4444' }}
                                        >
                                            {favorite.category_name}
                                        </span>
                                    </div>
                                )}

                                {/* Remove Button */}
                                <div className="text-center">
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openRemoveModal(favorite.id, favorite.button_name);
                                        }}
                                        className="btn btn-sm btn-outline btn-error hover:btn-error opacity-60 hover:opacity-100 transition-all duration-200"
                                        title="Remove from favorites"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-4 h-4"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                )}

            {/* Remove Confirmation Modal */}
            {itemToRemove && (
                <div className="modal modal-open" onClick={() => setItemToRemove(null)}>
                    <div className="modal-box relative" onClick={(e) => e.stopPropagation()}>
                        {/* Close button */}
                        <button
                            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
                            onClick={() => setItemToRemove(null)}
                        >
                            ✕
                        </button>

                        {/* Icon */}
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-full bg-error/10 flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-error" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </div>
                        </div>

                        {/* Title */}
                        <h3 className="font-bold text-xl text-center mb-2">Remove from Favorites</h3>

                        {/* Message */}
                        <p className="text-center py-4 text-base-content/80">
                            Are you sure you want to remove<br />
                            <strong className="text-lg">{itemToRemove.name}</strong><br />
                            from your favorites?
                        </p>

                        {/* Actions */}
                        <div className="modal-action justify-center gap-3">
                            <button
                                className="btn btn-ghost"
                                onClick={() => setItemToRemove(null)}
                            >
                                Cancel
                            </button>
                            <button
                                className="btn btn-error"
                                onClick={confirmRemove}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                                Remove
                            </button>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
