import { Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

const DefaultFallback = () => (
  <div className="fixed inset-0 flex items-center justify-center">
    <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
  </div>
);

const NotAuthorized = () => (
  <div className="fixed inset-0 flex flex-col items-center justify-center gap-2 text-center px-4">
    <h1 className="text-xl font-semibold">Not authorized</h1>
    <p className="text-muted-foreground">Your account does not have admin access.</p>
  </div>
);

export default function ProtectedRoute({ fallback = <DefaultFallback />, unauthenticatedElement }) {
  const { isAuthenticated, isAdmin, isLoadingAuth, authChecked } = useAuth();

  if (isLoadingAuth || !authChecked) {
    return fallback;
  }

  if (!isAuthenticated) {
    return unauthenticatedElement;
  }

  if (!isAdmin) {
    return <NotAuthorized />;
  }

  return <Outlet />;
}
