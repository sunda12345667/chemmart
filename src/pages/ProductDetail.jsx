import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useCart } from '@/lib/cartStore';
import { formatPrice, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, FileText, Download, ChevronLeft, Package, Globe, Beaker, MessageCircle } from 'lucide-react';
import ProductCard from '@/components/shared/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedPackaging, setSelectedPackaging] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  const { data: allProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.filter({ is_active: true }, '-created_date', 100),
    initialData: [],
  });

  const product = allProducts.find(p => p.slug === slug || p.id === slug);

  const relatedProducts = product
    ? allProducts.filter(p => p.id !== product.id && p.category_id === product.category_id).slice(0, 4)
    : [];

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <p className="text-muted-foreground">Product not found</p>
        <Link to="/products"><Button variant="outline" className="mt-4">Browse Products</Button></Link>
      </div>
    );
  }

  const images = product.images?.length ? product.images : ['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&h=450&fit=crop'];
  const stockStatus = product.stock_status || 'in_stock';

  const renderPrice = () => {
    if (product.price_mode === 'fixed' && product.price) {
      return <span className="text-3xl font-bold">{formatPrice(product.price)}</span>;
    }
    if (product.price_mode === 'range') {
      return <span className="text-3xl font-bold">{formatPrice(product.price_min)} – {formatPrice(product.price_max)}</span>;
    }
    return <span className="text-xl font-semibold text-primary">Request Quote for Pricing</span>;
  };

  const whatsappMsg = `Hello ChemMart, I'm interested in:\n\n*${product.name}*\n${product.grade ? `Grade: ${product.grade}\n` : ''}Quantity: ${quantity}\n${selectedPackaging ? `Packaging: ${selectedPackaging}\n` : ''}\nPlease send me pricing and availability details.`;

  const handleAddToCart = () => {
    addItem(product, quantity, selectedPackaging);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <span>/</span>
        <Link to="/products" className="hover:text-foreground">Products</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        {/* Images */}
        <div>
          <div className="aspect-square rounded-xl overflow-hidden bg-muted mb-4">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${selectedImage === i ? 'border-primary' : 'border-transparent'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className={STOCK_STATUS_COLORS[stockStatus]}>{STOCK_STATUS_LABELS[stockStatus]}</Badge>
            {product.is_featured && <Badge className="bg-accent text-accent-foreground">Featured</Badge>}
          </div>

          <h1 className="font-heading text-2xl md:text-3xl font-bold mb-2">{product.name}</h1>
          {product.short_description && <p className="text-muted-foreground mb-4">{product.short_description}</p>}

          <div className="mb-6">{renderPrice()}</div>

          <Separator className="my-4" />

          {/* Specs */}
          <div className="grid grid-cols-2 gap-3 text-sm mb-6">
            {product.grade && (
              <div className="flex items-center gap-2">
                <Beaker className="h-4 w-4 text-muted-foreground" />
                <span><strong>Grade:</strong> {product.grade}</span>
              </div>
            )}
            {product.purity && (
              <div className="flex items-center gap-2">
                <Beaker className="h-4 w-4 text-muted-foreground" />
                <span><strong>Purity:</strong> {product.purity}</span>
              </div>
            )}
            {product.country_of_origin && (
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <span><strong>Origin:</strong> {product.country_of_origin}</span>
              </div>
            )}
            {product.minimum_order_qty > 1 && (
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground" />
                <span><strong>MOQ:</strong> {product.minimum_order_qty} units</span>
              </div>
            )}
          </div>

          {/* Packaging & Quantity */}
          <div className="space-y-4 mb-6">
            {product.packaging_sizes?.length > 0 && (
              <div>
                <label className="text-sm font-medium mb-1.5 block">Packaging Size</label>
                <Select value={selectedPackaging} onValueChange={setSelectedPackaging}>
                  <SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger>
                  <SelectContent>
                    {product.packaging_sizes.map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1.5 block">Quantity</label>
              <Input
                type="number"
                min={product.minimum_order_qty || 1}
                value={quantity}
                onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-32"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
              <ShoppingCart className="h-5 w-5" /> Add to Cart
            </Button>
            <a
              href={`https://wa.me/2349074648050?text=${encodeURIComponent(whatsappMsg)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1"
            >
              <Button size="lg" className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white gap-2">
                <MessageCircle className="h-5 w-5" /> Order on WhatsApp
              </Button>
            </a>
          </div>

          {/* Documents */}
          {(product.sds_url || product.tds_url) && (
            <div className="mt-6 flex gap-3">
              {product.sds_url && (
                <a href={product.sds_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <Download className="h-4 w-4" /> Safety Data Sheet
                  </Button>
                </a>
              )}
              {product.tds_url && (
                <a href={product.tds_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="sm" className="gap-1.5">
                    <FileText className="h-4 w-4" /> Technical Data Sheet
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="description" className="mb-16">
        <TabsList>
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="technical">Technical Details</TabsTrigger>
          <TabsTrigger value="applications">Applications</TabsTrigger>
        </TabsList>
        <TabsContent value="description" className="mt-4 prose prose-sm max-w-none">
          <p className="text-muted-foreground whitespace-pre-wrap">{product.technical_description || product.short_description || 'No description available.'}</p>
        </TabsContent>
        <TabsContent value="technical" className="mt-4">
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            {product.grade && <div className="bg-muted/50 p-3 rounded-lg"><strong>Grade:</strong> {product.grade}</div>}
            {product.purity && <div className="bg-muted/50 p-3 rounded-lg"><strong>Purity:</strong> {product.purity}</div>}
            {product.country_of_origin && <div className="bg-muted/50 p-3 rounded-lg"><strong>Origin:</strong> {product.country_of_origin}</div>}
            {product.machine_type && <div className="bg-muted/50 p-3 rounded-lg"><strong>Machine Type:</strong> {product.machine_type}</div>}
            {product.production_capacity && <div className="bg-muted/50 p-3 rounded-lg"><strong>Capacity:</strong> {product.production_capacity}</div>}
          </div>
        </TabsContent>
        <TabsContent value="applications" className="mt-4">
          <p className="text-muted-foreground whitespace-pre-wrap">{product.applications || 'Applications information not available.'}</p>
        </TabsContent>
      </Tabs>

      {/* Related */}
      {relatedProducts.length > 0 && (
        <section className="mb-16">
          <h2 className="font-heading text-xl font-bold mb-6">Related Products</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={(prod) => addItem(prod, 1, '')} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}