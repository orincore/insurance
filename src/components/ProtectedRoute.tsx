import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const token = localStorage.getItem('token');

  // If the auth state is false and no token is found, redirect to login.
  if (!isAuthenticated && !token) {
    return <Navigate to="/login" replace />;
  }

  // Otherwise, allow access to the protected content.
  return children;
};
