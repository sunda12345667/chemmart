import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Product } from '@/lib/entities';
import { useCart } from '@/lib/cartStore';
import ProductCard from '@/components/shared/ProductCard';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { CATEGORIES } from '@/lib/constants';

export default function Products() {
  const params = new URLSearchParams(window.location.search);
  const initialSearch = params.get('search') || '';
  const initialCategory = params.get('category') || 'all';

  const [search, setSearch] = useState(initialSearch);
  const [category, setCategory] = useState(initialCategory);
  const [stockFilter, setStockFilter] = useState('all');
  const [priceSort, setPriceSort] = useState('newest');
  const { addItem } = useCart();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => Product.filter({ is_active: true }, '-created_date', 100),
    initialData: [],
  });

  const filtered = useMemo(() => {
    let result = [...products];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(p =>
        p.name?.toLowerCase().includes(q) ||
        p.short_description?.toLowerCase().includes(q) ||
        p.applications?.toLowerCase().includes(q) ||
        p.grade?.toLowerCase().includes(q) ||
        p.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (category && category !== 'all') {
      result = result.filter(p => p.category_id === category);
    }

    if (stockFilter !== 'all') {
      result = result.filter(p => p.stock_status === stockFilter);
    }

    if (priceSort === 'price_low') {
      result.sort((a, b) => (a.price || 0) - (b.price || 0));
    } else if (priceSort === 'price_high') {
      result.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (priceSort === 'name') {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [products, search, category, stockFilter, priceSort]);

  const activeFilters = [
    category !== 'all' && category,
    stockFilter !== 'all' && stockFilter,
  ].filter(Boolean);

  const clearFilters = () => {
    setSearch('');
    setCategory('all');
    setStockFilter('all');
    setPriceSort('newest');
  };

  const handleAddToCart = (product) => {
    addItem(product, 1, product.packaging_sizes?.[0] || '');
  };

  const FilterPanel = () => (
    <div className="space-y-6">
      <div>
        <label className="text-sm font-medium mb-2 block">Category</label>
        <Select value={category} onValueChange={setCategory}>
          <SelectTrigger><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {CATEGORIES.map(c => (
              <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Stock Status</label>
        <Select value={stockFilter} onValueChange={setStockFilter}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any</SelectItem>
            <SelectItem value="in_stock">In Stock</SelectItem>
            <SelectItem value="low_stock">Low Stock</SelectItem>
            <SelectItem value="pre_order">Pre-Order</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Sort By</label>
        <Select value={priceSort} onValueChange={setPriceSort}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price_low">Price: Low to High</SelectItem>
            <SelectItem value="price_high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name A–Z</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {activeFilters.length > 0 && (
        <Button variant="ghost" size="sm" onClick={clearFilters} className="w-full text-destructive">
          <X className="h-4 w-4 mr-1" /> Clear Filters
        </Button>
      )}
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Products</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
          {search && <span> for "<strong>{search}</strong>"</span>}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 flex-shrink-0">
          <div className="sticky top-36">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <FilterPanel />
          </div>
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Mobile search & filter */}
          <div className="lg:hidden flex gap-2 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon">
                  <SlidersHorizontal className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader><SheetTitle>Filters</SheetTitle></SheetHeader>
                <div className="mt-6"><FilterPanel /></div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active filter badges */}
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {activeFilters.map(f => (
                <Badge key={f} variant="secondary" className="gap-1">
                  {f}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => {
                    if (f === category) setCategory('all');
                    if (f === stockFilter) setStockFilter('all');
                  }} />
                </Badge>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="bg-muted animate-pulse rounded-xl h-56 sm:h-72" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-muted-foreground">No products found</p>
              <Button variant="outline" className="mt-4" onClick={clearFilters}>Clear Filters</Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
              {filtered.map(product => (
                <ProductCard key={product.id} product={product} onAddToCart={handleAddToCart} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}