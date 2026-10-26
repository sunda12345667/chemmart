import React from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin } from 'lucide-react';
import { CATEGORIES, COMPANY_NAME, COMPANY_PHONE, COMPANY_PHONE_TEL, COMPANY_EMAIL, COMPANY_ADDRESS } from '@/lib/constants';

export default function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          <div className="col-span-2 sm:col-span-1">
            <h3 className="font-heading text-xl font-bold mb-4">
              <span className="text-primary">AM</span>TECH
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {COMPANY_NAME} provides engineering, equipment and contracting solutions covering water treatment, borehole drilling, plumbing and fitting, equipment supply, building supervision and general contracting.
            </p>
            <div className="mt-4 space-y-2 text-sm">
              <a href={COMPANY_PHONE_TEL} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Phone className="h-4 w-4" /> {COMPANY_PHONE}
              </a>
              <a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" /> {COMPANY_EMAIL}
              </a>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" /> {COMPANY_ADDRESS}
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              {CATEGORIES.map(cat => (
                <li key={cat.slug}>
                  <Link to={`/products?category=${cat.slug}`} className="text-muted-foreground hover:text-primary transition-colors">
                    {cat.name}
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
              <li><Link to="/about" className="text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="text-muted-foreground hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-heading font-semibold mb-4">Trust & Safety</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>✓ Verified Equipment</li>
              <li>✓ NAFDAC-Compliant Consultancy</li>
              <li>✓ Certified Installations</li>
              <li>✓ Nationwide Service</li>
              <li>✓ Secure Transactions</li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {COMPANY_NAME} — All rights reserved.</p>
          <p className="mt-1 sm:mt-0">Engineering, Equipment & Industrial Solutions</p>
        </div>
      </div>
    </footer>
  );
}
