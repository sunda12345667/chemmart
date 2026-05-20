import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Search, Menu, X, Phone, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

const CATEGORIES = [
  { name: 'Chemicals', slug: 'chemicals' },
  { name: 'Plastic Raw Materials', slug: 'plastic-raw-materials' },
  { name: 'Production Machines', slug: 'production-machines' },
  { name: 'Packaging Materials', slug: 'packaging-materials' },
  { name: 'Cleaning Chemicals', slug: 'cleaning-chemical-raw-materials' },
  { name: 'Additives', slug: 'additives' },
  { name: 'Recycled Materials', slug: 'recycled-materials' },
  { name: 'Spare Parts', slug: 'spare-parts' },
];

export default function Navbar({ cartCount = 0 }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar */}
      <div className="bg-secondary text-secondary-foreground">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <a href="tel:09074648050" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Phone className="h-3 w-3" />
              <span>09074648050</span>
            </a>
            <span className="hidden sm:inline text-muted-foreground">|</span>
            <span className="hidden sm:inline text-muted-foreground">Nigeria's Trusted Chemical & Industrial Marketplace</span>
          </div>
          <Link to="/admin" className="text-muted-foreground hover:text-primary transition-colors">
            Admin
          </Link>
        </div>
      </div>

      {/* Main nav */}
      <div className="bg-card border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0">
              <h1 className="font-heading text-xl sm:text-2xl font-bold">
                <span className="text-primary">Chem</span>
                <span className="text-secondary">Mart</span>
                <span className="text-primary">.ng</span>
              </h1>
            </Link>

            {/* Search */}
            <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-xl">
              <div className="relative w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search chemicals, plastics, machines..."
                  className="pl-9 pr-20 h-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Button type="submit" size="sm" className="absolute right-1 top-1/2 -translate-y-1/2 h-8 bg-primary">
                  Search
                </Button>
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">
              <Link to="/cart" className="relative">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {cartCount > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-primary">
                      {cartCount}
                    </Badge>
                  )}
                </Button>
              </Link>

              <a
                href="https://wa.me/2349074648050?text=Hello%20ChemMart,%20I%20need%20help%20with%20an%20order."
                target="_blank"
                rel="noopener noreferrer"
                className="hidden sm:flex"
              >
                <Button size="sm" className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-1.5">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                  Order via WhatsApp
                </Button>
              </a>

              {/* Mobile menu */}
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="p-4 border-b">
                    <h2 className="font-heading text-lg font-bold">
                      <span className="text-primary">Chem</span>Mart<span className="text-primary">.ng</span>
                    </h2>
                  </div>
                  <form onSubmit={(e) => { handleSearch(e); setMobileOpen(false); }} className="p-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Search products..."
                        className="pl-9"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </form>
                  <nav className="px-4 space-y-1">
                    <Link to="/" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-md hover:bg-muted transition-colors font-medium">
                      Home
                    </Link>
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-3 pb-1">Categories</p>
                    {CATEGORIES.map(cat => (
                      <Link
                        key={cat.slug}
                        to={`/products?category=${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                        className="block py-2 px-3 rounded-md hover:bg-muted transition-colors text-sm"
                      >
                        {cat.name}
                      </Link>
                    ))}
                    <div className="border-t pt-3 mt-3 space-y-1">
                      <Link to="/quote" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-md hover:bg-muted transition-colors font-medium">
                        Request Bulk Quote
                      </Link>
                      <Link to="/blog" onClick={() => setMobileOpen(false)} className="block py-2.5 px-3 rounded-md hover:bg-muted transition-colors font-medium">
                        Resources
                      </Link>
                    </div>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>

        {/* Category bar - desktop */}
        <div className="hidden md:block border-t bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <nav className="flex items-center gap-1 overflow-x-auto py-1">
              <Link to="/products" className="px-3 py-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap rounded-md hover:bg-muted">
                All Products
              </Link>
              {CATEGORIES.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/products?category=${cat.slug}`}
                  className="px-3 py-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap rounded-md hover:bg-muted"
                >
                  {cat.name}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}