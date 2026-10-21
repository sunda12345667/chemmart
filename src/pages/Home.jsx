import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/entities';
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
    queryFn: () => Product.filter({ is_featured: true, is_active: true }, '-created_date', 8),
    initialData: [],
  });

  const { data: allProducts = [] } = useQuery({
    queryKey: ['all-products-home'],
    queryFn: () => Product.filter({ is_active: true }, '-created_date', 12),
    initialData: [],
  });

  // Separate by category for different sections
  const waterTreatment = allProducts.filter(p => p.category_id === 'water-treatment');
  const plumbing = allProducts.filter(p => p.category_id === 'plumbing-fittings');
  const factoryEquipment = allProducts.filter(p => p.category_id === 'factory-equipment');

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
          subtitle="Top picks for Nigerian businesses"
          onAddToCart={handleAddToCart}
        />
      )}
      {waterTreatment.length > 0 && (
        <div className="bg-muted/30">
          <FeaturedProducts
            products={waterTreatment}
            title="Water Treatment"
            subtitle="Water treatment plants, deionizers and dispensers"
            linkTo="/products?category=water-treatment"
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
      {plumbing.length > 0 && (
        <FeaturedProducts
          products={plumbing}
          title="Plumbing & Fittings"
          subtitle="Pipes, fittings and plumbing materials"
          linkTo="/products?category=plumbing-fittings"
          onAddToCart={handleAddToCart}
        />
      )}
      {factoryEquipment.length > 0 && (
        <div className="bg-muted/30">
          <FeaturedProducts
            products={factoryEquipment}
            title="Factory & Industrial Equipment"
            subtitle="Processing and production equipment"
            linkTo="/products?category=factory-equipment"
            onAddToCart={handleAddToCart}
          />
        </div>
      )}
      <TrustSection />
      <CTASection />
    </div>
  );
}