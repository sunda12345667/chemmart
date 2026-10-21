import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/lib/AuthContext';

export default function SuperAdminRoute() {
  const { isLoadingAuth, authChecked, isSuperAdmin } = useAuth();
  if (isLoadingAuth || !authChecked) return <div className="fixed inset-0 grid place-items-center"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></div>;
  return isSuperAdmin ? <Outlet /> : <Navigate to="/admin/dashboard" replace />;
}
