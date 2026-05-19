import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { me } from '../api/auth';
import { LoadingSpinner } from '../components/feedback/LoadingSpinner';

export const ProtectedRoute = () => {
  const location = useLocation();
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const isHydrated = useAuthStore((s) => s.isHydrated);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const [bootstrapping, setBootstrapping] = useState(false);

  useEffect(() => {
    if (token && !user && isHydrated && !bootstrapping) {
      setBootstrapping(true);
      me()
        .then(setUser)
        .catch(() => logout())
        .finally(() => setBootstrapping(false));
    }
  }, [token, user, isHydrated, bootstrapping, setUser, logout]);

  if (!isHydrated) return null;
  if (!token) return <Navigate to="/login" replace state={{ from: location }} />;
  if (bootstrapping) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner label="Loading session" />
      </div>
    );
  }
  return <Outlet />;
};
