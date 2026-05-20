import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="font-heading text-xl font-bold mb-4">
              <span className="text-primary">Chem</span>Mart<span className="text-primary">.ng</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Nigeria's most trusted digital marketplace for industrial chemicals, plastic raw materials, and production machinery.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a href="tel:09074648050" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" /> 09074648050
              </a>
              <a href="mailto:info@chemmart.ng" className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" /> info@chemmart.ng
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" /> Lagos, Nigeria
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {['Chemicals', 'Plastic Raw Materials', 'Production Machines', 'Packaging Materials', 'Cleaning Chemicals', 'Additives'].map(cat => (
                <li key={cat}>
                  <Link to={`/products?category=${cat.toLowerCase().replace(/ /g, '-')}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/quote" className="text-muted-foreground hover:text-primary transition-colors">Request Bulk Quote</Link></li>
              <li><Link to="/products" className="text-muted-foreground hover:text-primary transition-colors">All Products</Link></li>
              <li><Link to="/blog" className="text-muted-foreground hover:text-primary transition-colors">Resources & Guides</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Trust & Safety</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Verified Suppliers</li>
              <li>✓ Quality Certified Products</li>
              <li>✓ Safety Data Sheets Available</li>
              <li>✓ Nationwide Delivery</li>
              <li>✓ Secure Transactions</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} ChemMart.ng — All rights reserved.</p>
          <p className="mt-1 sm:mt-0">Nigeria's Industrial Marketplace</p>
        </div>
      </div>
    </footer>
  );
}