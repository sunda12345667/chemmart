import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import WhatsAppFloatingButton from '../shared/WhatsAppFloatingButton';
import { useCart } from '@/lib/cartStore';

export default function MainLayout() {
  const { itemCount } = useCart();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar cartCount={itemCount} />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <WhatsAppFloatingButton />
    </div>
  );
}