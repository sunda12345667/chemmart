import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatPrice, STOCK_STATUS_LABELS, STOCK_STATUS_COLORS } from '@/lib/constants';

export default function ProductCard({ product, onAddToCart }) {
  const renderPrice = () => {
    if (product.price_mode === 'fixed' && product.price) {
      return <span className="text-lg font-bold text-foreground">{formatPrice(product.price)}</span>;
    }
    if (product.price_mode === 'range' && product.price_min && product.price_max) {
      return <span className="text-lg font-bold text-foreground">{formatPrice(product.price_min)} – {formatPrice(product.price_max)}</span>;
    }
    return <span className="text-sm font-semibold text-primary">Request Quote</span>;
  };

  const stockStatus = product.stock_status || 'in_stock';
  const productImage = product.images?.[0] || 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&h=300&fit=crop';

  return (
    <Card className="group overflow-hidden border hover:shadow-lg transition-all duration-300 h-full flex flex-col">
      <Link to={`/product/${product.slug || product.id}`} className="block relative overflow-hidden aspect-[4/3]">
        <img
          src={productImage}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {product.is_featured && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground text-xs">Featured</Badge>
        )}
        <Badge className={`absolute top-2 right-2 text-xs ${STOCK_STATUS_COLORS[stockStatus]}`}>
          {STOCK_STATUS_LABELS[stockStatus]}
        </Badge>
      </Link>
      <CardContent className="p-4 flex flex-col flex-1">
        <Link to={`/product/${product.slug || product.id}`} className="block">
          <h3 className="font-heading font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          {product.grade && (
            <p className="text-xs text-muted-foreground mt-1">Grade: {product.grade}</p>
          )}
        </Link>
        <div className="mt-auto pt-3">
          <div className="mb-2">{renderPrice()}</div>
          {product.minimum_order_qty > 1 && (
            <p className="text-xs text-muted-foreground mb-2">MOQ: {product.minimum_order_qty} units</p>
          )}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              className="flex-1 text-xs"
              onClick={(e) => { e.preventDefault(); onAddToCart?.(product); }}
            >
              <ShoppingCart className="h-3.5 w-3.5 mr-1" />
              Add to Cart
            </Button>
            <Link to={`/product/${product.slug || product.id}`}>
              <Button size="sm" variant="ghost" className="text-xs">
                <Eye className="h-3.5 w-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}