import React from 'react';
import { Link } from 'react-router-dom';
import { FlaskConical, Box, Cog, Package, Droplets, Layers, Recycle, Wrench, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const CATEGORIES = [
  { name: 'Chemicals', slug: 'chemicals', icon: FlaskConical, desc: 'Industrial & laboratory chemicals', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Plastic Raw Materials', slug: 'plastic-raw-materials', icon: Box, desc: 'HDPE, LDPE, PP, PET, PVC & more', color: 'bg-green-50 text-green-700 border-green-200' },
  { name: 'Production Machines', slug: 'production-machines', icon: Cog, desc: 'Manufacturing equipment', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Packaging Materials', slug: 'packaging-materials', icon: Package, desc: 'Bottles, drums, containers', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Cleaning Chemicals', slug: 'cleaning-chemical-raw-materials', icon: Droplets, desc: 'Raw materials for cleaning products', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Additives', slug: 'additives', icon: Layers, desc: 'Color, fragrance, stabilizers', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Recycled Materials', slug: 'recycled-materials', icon: Recycle, desc: 'Eco-friendly raw materials', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Spare Parts', slug: 'spare-parts', icon: Wrench, desc: 'Machine parts & accessories', color: 'bg-slate-50 text-slate-700 border-slate-200' },
];

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Browse by Category</h2>
          <p className="text-muted-foreground mt-2">Find exactly what your business needs</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, i) => (
            <motion.div
              key={cat.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <Link
                to={`/products?category=${cat.slug}`}
                className={`group block p-3 sm:p-5 rounded-xl border ${cat.color} hover:shadow-md transition-all duration-300`}
              >
                <cat.icon className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
                <h3 className="font-heading font-semibold text-xs sm:text-sm">{cat.name}</h3>
                <p className="text-xs mt-0.5 opacity-70 hidden sm:block">{cat.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  Browse <ArrowRight className="h-3 w-3" />
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}