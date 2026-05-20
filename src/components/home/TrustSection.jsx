import React from 'react';
import { Shield, Truck, Award, FileCheck, Headphones, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

const FEATURES = [
  { icon: Shield, title: 'Verified Products', desc: 'Every product sourced from certified and verified suppliers' },
  { icon: FileCheck, title: 'SDS & TDS Available', desc: 'Safety & technical data sheets for all chemical products' },
  { icon: Truck, title: 'Nationwide Delivery', desc: 'Fast delivery to all 36 states and FCT Abuja' },
  { icon: Award, title: 'Quality Guarantee', desc: 'Certified grades with purity verification' },
  { icon: Headphones, title: 'Expert Support', desc: 'Technical experts available for product guidance' },
  { icon: Lock, title: 'Secure Transactions', desc: 'All orders processed through verified WhatsApp channel' },
];

export default function TrustSection() {
  return (
    <section className="py-16 bg-muted/50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="font-heading text-2xl md:text-3xl font-bold">Why Nigerian Businesses Trust ChemMart</h2>
          <p className="text-muted-foreground mt-2">Built for the Nigerian industrial market</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="bg-card rounded-xl p-6 border hover:shadow-md transition-shadow"
            >
              <div className="inline-flex p-3 rounded-lg bg-primary/10 mb-4">
                <f.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}