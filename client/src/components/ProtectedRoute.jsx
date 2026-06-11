import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Gates a route behind authentication. While the session is being restored we
// show a lightweight loading state to avoid a flash redirect to /login.
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) return <div className="centered">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
