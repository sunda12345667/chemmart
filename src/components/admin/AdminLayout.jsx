import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, Users, FileText, Settings, ChevronLeft, Menu, LogOut, Boxes, ShoppingCart, Wrench, ClipboardList, ReceiptText, Image, FilePenLine, ShieldCheck, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/AuthContext';

const NAV_ITEMS = [
  { path: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { path: '/admin/products', label: 'Products', icon: Package },
  { path: '/admin/categories', label: 'Categories', icon: Tag },
  { path: '/admin/inventory', label: 'Inventory', icon: Boxes },
  { path: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { path: '/admin/customers', label: 'Customers', icon: Users },
  { path: '/admin/services', label: 'Services', icon: Wrench },
  { path: '/admin/service-requests', label: 'Service Requests', icon: ClipboardList },
  { path: '/admin/quotes', label: 'Quote Requests', icon: FileText },
  { path: '/admin/invoices', label: 'Invoices', icon: ReceiptText },
  { path: '/admin/media', label: 'Media', icon: Image },
  { path: '/admin/content', label: 'Website Content', icon: FilePenLine, superAdmin: true },
  { path: '/admin/settings', label: 'Settings', icon: Settings, superAdmin: true },
  { path: '/admin/users', label: 'Admin Users', icon: ShieldCheck, superAdmin: true },
  { path: '/admin/audit-logs', label: 'Audit Logs', icon: History, superAdmin: true },
];

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, isSuperAdmin } = useAuth();

  const isActive = (path, exact) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-sidebar-border">
        <Link to="/admin/dashboard" className="font-heading text-lg font-bold text-sidebar-foreground">
          <span className="text-primary">AM</span>TECH
        </Link>
        <p className="text-xs text-muted-foreground mt-0.5">Admin Panel</p>
      </div>
      <nav className="min-h-0 flex-1 overflow-y-auto p-3 space-y-1">
        {NAV_ITEMS.filter(item => !item.superAdmin || isSuperAdmin).map(item => (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors opacity-100',
              isActive(item.path, item.exact)
                ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                : 'text-sidebar-foreground hover:bg-sidebar-accent'
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!collapsed && <span>{item.label}</span>}
          </Link>
        ))}
      </nav>
      <div className="p-3 border-t border-sidebar-border space-y-1">
        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
          <ChevronLeft className="h-4 w-4" /> {!collapsed && 'Back to Site'}
        </Link>
        <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent transition-colors w-full text-left">
          <LogOut className="h-4 w-4" /> {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex h-dvh flex-col bg-sidebar border-r border-sidebar-border transition-all', collapsed ? 'w-16' : 'w-60')}>
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-60 bg-sidebar">
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-14 border-b bg-card flex items-center justify-between px-4 flex-shrink-0">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden lg:block">
            <Button variant="ghost" size="sm" onClick={() => setCollapsed(!collapsed)}>
              <Menu className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-sm text-muted-foreground">Admin Dashboard</div>
        </header>
        <main className="flex-1 overflow-auto p-3 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
