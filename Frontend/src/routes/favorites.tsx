import { createFileRoute } from '@tanstack/react-router';
import { useFavorites } from '../hooks/useFavorites';
import { usePlayHistory } from '../hooks/usePlayHistory';
import { useRef } from 'react';

export const Route = createFileRoute('/favorites')({
    component: FavoritesPage,
});

function FavoritesPage() {
    const { favorites, loading, error, removeFavorite } = useFavorites();
    const { recordPlay } = usePlayHistory();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const handlePlay = async (soundUrl: string, uploadedId: number) => {
        if (audioRef.current) {
            audioRef.current.src = soundUrl;
            audioRef.current.play();
            await recordPlay(uploadedId);
        }
    };

    const handleRemoveFavorite = async (uploadedId: number) => {
        if (confirm('Retirer ce bouton des favoris ?')) {
            await removeFavorite(uploadedId);
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
        <div className="container mx-auto px-4 py-8">
            <audio ref={audioRef} />

            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-bold mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="inline-block w-10 h-10 mr-3 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                    </svg>
                    Mes Favoris
                </h1>
                <p className="text-base-content/70">
                    {favorites.length} son{favorites.length !== 1 ? 's' : ''} favori{favorites.length !== 1 ? 's' : ''}
                </p>
            </div>

            {/* Favorites Grid */}
            {favorites.length === 0 ? (
                <div className="text-center py-16">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 mx-auto mb-4 text-base-content/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    <h3 className="text-2xl font-semibold mb-2">Aucun favori</h3>
                    <p className="text-base-content/70 mb-4">
                        Ajoutez des sons à vos favoris pour les retrouver facilement ici
                    </p>
                    <a href="/buttons" className="btn btn-primary">
                        Parcourir les sons
                    </a>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                    {favorites.map((favorite) => (
                        <div
                            key={favorite.id}
                            className="card bg-base-200 hover:bg-base-300 transition-all duration-200 cursor-pointer group"
                            style={{
                                borderLeft: favorite.category_color
                                    ? `4px solid ${favorite.category_color}`
                                    : undefined,
                            }}
                        >
                            <div className="card-body p-3">
                                {/* Image */}
                                <div
                                    className="aspect-square rounded-lg overflow-hidden mb-2 relative"
                                    onClick={() => handlePlay(favorite.soundUrl, favorite.id)}
                                >
                                    <img
                                        src={favorite.imageUrl}
                                        alt={favorite.button_name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-200 flex items-center justify-center">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                            fill="currentColor"
                                            viewBox="0 0 24 24"
                                        >
                                            <path d="M8 5v14l11-7z" />
                                        </svg>
                                    </div>
                                </div>

                                {/* Name */}
                                <h3 className="font-medium text-sm truncate" title={favorite.button_name}>
                                    {favorite.button_name}
                                </h3>

                                {/* Category */}
                                {favorite.category_name && (
                                    <p className="text-xs text-base-content/60 truncate">
                                        {favorite.category_name}
                                    </p>
                                )}

                                {/* Remove Button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFavorite(favorite.id);
                                    }}
                                    className="btn btn-sm btn-ghost btn-circle absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Retirer des favoris"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-5 h-5 text-red-500"
                                        fill="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
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
