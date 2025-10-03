import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useAuth } from '@/context/AuthContext'
import HomeButtons from "@/components/HomeButtons";

export const Route = createFileRoute('/home')({
  component: RouteComponent,
})

function RouteComponent() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // Show loading while checking auth
  if (loading) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="card bg-base-100 shadow-xl p-8">
            <span className="loading loading-spinner loading-lg text-primary"></span>
            <p className="mt-4 text-base-content">Loading your sound collection...</p>
          </div>
        </div>
      </div>
    );
  }

  // Simply show login message if no user (don't redirect to prevent loops)
  if (!user) {
    return (
      <div className="hero min-h-screen bg-base-200">
        <div className="hero-content text-center">
          <div className="card bg-base-100 shadow-xl p-8">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
            <p className="mb-6 opacity-60">Please log in to access your sound collection.</p>
            <button 
              onClick={() => navigate({ to: '/' })}
              className="btn btn-primary"
            >
              Go to Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <HomeButtons />;
}
