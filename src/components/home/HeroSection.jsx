import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowRight, Shield, Truck, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

export default function HeroSection() {
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/products?search=${encodeURIComponent(search.trim())}`);
    }
  };

  return (
    <section className="relative overflow-hidden bg-secondary">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5" style={{
        backgroundImage: 'radial-gradient(circle at 25% 50%, white 1px, transparent 1px)',
        backgroundSize: '50px 50px'
      }} />

      <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-6">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-sm text-primary font-medium">Nigeria's #1 Industrial Marketplace</span>
            </div>

            <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl font-bold text-white leading-tight">
              Source <span className="text-primary">Chemicals</span>, Plastics & Machinery at Scale
            </h1>

            <p className="mt-4 text-base md:text-lg text-gray-300 max-w-lg leading-relaxed">
              Direct access to verified industrial chemicals, plastic raw materials, and production equipment. 
              Bulk orders, competitive pricing, nationwide delivery across Nigeria.
            </p>

            <form onSubmit={handleSearch} className="mt-8 flex gap-2 max-w-md">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products, chemicals, machines..."
                  className="pl-9 h-12 bg-white text-foreground"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" size="lg" className="h-12 bg-primary hover:bg-primary/90 px-6">
                Search
              </Button>
            </form>

            <div className="mt-8 flex flex-wrap gap-4">
              <a href="https://wa.me/2349074648050?text=Hello%20ChemMart,%20I%20want%20to%20request%20a%20bulk%20quote." target="_blank" rel="noopener noreferrer">
                <Button size="lg" className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2">
                  <svg viewBox="0 0 24 24" className="h-5 w-5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Request Bulk Quote
                </Button>
              </a>
              <Button size="lg" variant="outline" className="text-white border-white/30 hover:bg-white/10 gap-2" onClick={() => navigate('/products')}>
                Browse Products <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:block"
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-4">
                <img src="https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop" alt="Industrial chemicals" className="rounded-xl w-full object-cover h-44 shadow-lg" />
                <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=250&fit=crop" alt="Plastic materials" className="rounded-xl w-full object-cover h-36 shadow-lg" />
              </div>
              <div className="space-y-4 pt-8">
                <img src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=400&h=250&fit=crop" alt="Production machines" className="rounded-xl w-full object-cover h-36 shadow-lg" />
                <img src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop" alt="Warehouse" className="rounded-xl w-full object-cover h-44 shadow-lg" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Trust badges */}
        <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl">
          {[
            { icon: Shield, label: 'Verified Suppliers', sub: '100% quality assured' },
            { icon: Truck, label: 'Nationwide Delivery', sub: 'All 36 states + FCT' },
            { icon: Award, label: 'Quality Certified', sub: 'SDS & TDS available' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{label}</p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}