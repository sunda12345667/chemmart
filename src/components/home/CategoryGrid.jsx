import React from 'react';
import { Link } from 'react-router-dom';
import { Droplets, GlassWater, WashingMachine, Wrench, Drill, Cog, Building2, Package, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { CATEGORIES } from '@/lib/constants';

const ICONS = { Droplets, GlassWater, WashingMachine, Wrench, Drill, Cog, Building2, Package };

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Browse by Category</h2>
          <p className="text-muted-foreground mt-2">Find exactly what your business needs</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {CATEGORIES.map((cat, i) => {
            const IconComp = ICONS[cat.icon];
            return (
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
                  <IconComp className="h-6 w-6 sm:h-8 sm:w-8 mb-2 sm:mb-3" />
                  <h3 className="font-heading font-semibold text-xs sm:text-sm">{cat.name}</h3>
                  <p className="text-xs mt-0.5 opacity-70 hidden sm:block">{cat.desc}</p>
                  <div className="mt-3 flex items-center gap-1 text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Browse <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
