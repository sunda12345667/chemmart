import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import HeroSection from '@/components/home/HeroSection';
import CategoryGrid from '@/components/home/CategoryGrid';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import TrustSection from '@/components/home/TrustSection';
import CTASection from '@/components/home/CTASection';
import { useCart } from '@/lib/cartStore';

export default function Home() {
  const { addItem } = useCart();

  const { data: featuredProducts = [] } = useQuery({
    queryKey: ['featured-products'],
    queryFn: () => base44.entities.Product.filter({ is_featured: true, is_active: true }, '-created_date', 8),
    initialData: [],
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['all-products-home'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 12),
    initialData: [],
  });

  // Separate by category for different sections
  const chemicals = allProducts.filter(p => p.category_id === 'chemicals');
  const plastics = allProducts.filter(p => p.category_id === 'plastic-raw-materials');
  const machines = allProducts.filter(p => p.category_id === 'production-machines');

  const handleAddToCart = (product) => {
    addItem(product, 1, product.packaging_sizes?.[0] || '');
  };

  return (
    <div>
      <HeroSection />
      <CategoryGrid />
      {featuredProducts.length > 0 && (
        <FeaturedProducts
          products={featuredProducts}
          title="Featured Products"
          subtitle="Top picks for Nigerian manufacturers"
          onAddToCart={handleAddToCart}
        />
      )}
      {chemicals.length > 0 && (
        <div className="bg-muted/30">
          <FeaturedProducts
            products={chemicals}
            title="Industrial Chemicals"
            subtitle="Lab-grade to industrial-grade chemicals"
            linkTo="/products?category=chemicals"
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
      {plastics.length > 0 && (
        <FeaturedProducts
          products={plastics}
          title="Plastic Raw Materials"
          subtitle="HDPE, LDPE, PP, PET, PVC and more"
          linkTo="/products?category=plastic-raw-materials"
          onAddToCart={handleAddToCart}
        />
      )}
      {machines.length > 0 && (
        <div className="bg-muted/30">
          <FeaturedProducts
            products={machines}
            title="Production Machines"
            subtitle="Manufacturing equipment for every production line"
            linkTo="/products?category=production-machines"
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
      <TrustSection />
      <CTASection />
    </div>
  );
}