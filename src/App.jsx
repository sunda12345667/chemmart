import React, { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import PageNotFound from './lib/PageNotFound';
import { AuthProvider } from '@/lib/AuthContext';
import ProtectedRoute from '@/components/ProtectedRoute';

// Layout
import MainLayout from '@/components/layout/MainLayout';
import AdminLayout from '@/components/admin/AdminLayout';

// Public pages
const Home = lazy(() => import('@/pages/Home'));
const Products = lazy(() => import('@/pages/Products'));
const ProductDetail = lazy(() => import('@/pages/ProductDetail'));
const Cart = lazy(() => import('@/pages/Cart'));
const RequestQuote = lazy(() => import('@/pages/RequestQuote'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPostDetail = lazy(() => import('@/pages/BlogPostDetail'));
const About = lazy(() => import('@/pages/About'));
const Contact = lazy(() => import('@/pages/Contact'));

// Auth pages
const Login = lazy(() => import('@/pages/Login'));
const Register = lazy(() => import('@/pages/Register'));
const ForgotPassword = lazy(() => import('@/pages/ForgotPassword'));
const ResetPassword = lazy(() => import('@/pages/ResetPassword'));

// Admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/Dashboard'));
const AdminProducts = lazy(() => import('@/pages/admin/AdminProducts'));
const AdminLeads = lazy(() => import('@/pages/admin/AdminLeads'));
const AdminCategories = lazy(() => import('@/pages/admin/AdminCategories'));
const AdminBlog = lazy(() => import('@/pages/admin/AdminBlog'));
const AdminLogin = lazy(() => import('@/pages/admin/AdminLogin'));
const DataTablePage = lazy(() => import('@/pages/admin/DataTablePage'));
import SuperAdminRoute from '@/components/SuperAdminRoute';

const AppRoutes = () => (
  <Suspense fallback={<div className="fixed inset-0 grid place-items-center" role="status" aria-label="Loading page"><div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" /></div>}>
  <Routes>
    {/* Auth routes */}
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />
    <Route path="/admin/login" element={<AdminLogin />} />

    {/* Public site routes with MainLayout */}
    <Route element={<MainLayout />}>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<Products />} />
      <Route path="/product/:slug" element={<ProductDetail />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/quote" element={<RequestQuote />} />
      <Route path="/blog" element={<Blog />} />
      <Route path="/blog/:slug" element={<BlogPostDetail />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
    </Route>

    {/* Admin routes — protected, admin only */}
    <Route element={<ProtectedRoute unauthenticatedElement={<Navigate to="/admin/login" replace />} />}>
      <Route element={<AdminLayout />}>
        <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProducts />} />
        <Route path="/admin/products/:id/edit" element={<AdminProducts />} />
        <Route path="/admin/leads" element={<AdminLeads />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/blog" element={<AdminBlog />} />
        <Route path="/admin/orders/:id" element={<DataTablePage type="orders" />} />
        {['inventory','orders','customers','services','service-requests','quotes','invoices','media'].map(type => <Route key={type} path={`/admin/${type}`} element={<DataTablePage type={type} />} />)}
        <Route element={<SuperAdminRoute />}>
          {['content','settings','users','audit-logs'].map(type => <Route key={type} path={`/admin/${type}`} element={<DataTablePage type={type} />} />)}
        </Route>
      </Route>
    </Route>

    <Route path="*" element={<PageNotFound />} />
  </Routes>
  </Suspense>
);

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AppRoutes />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
