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
      <div className="flex justify-center items-center h-screen text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Simply show login message if no user (don't redirect to prevent loops)
  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen text-white">
        <div className="text-center">
          <p>Please log in to access this page.</p>
          <button 
            onClick={() => navigate({ to: '/' })}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="p-4">
        <h1 className="text-2xl font-bold text-white mb-4">Welcome, {user.username}!</h1>
        <HomeButtons />
      </div>
    </div>
  );
}
