import { useState, useEffect, useCallback } from 'react';

const CART_KEY = 'chemcart_items';

function getStoredCart() {
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveCart(items) {
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

// Simple hook-based cart
export function useCart() {
  const [items, setItems] = useState(() => getStoredCart());

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = useCallback((product, quantity = 1, packagingSize = '') => {
    setItems(prev => {
      const existing = prev.find(i => i.product_id === product.id && i.packaging_size === packagingSize);
      if (existing) {
        return prev.map(i =>
          i.product_id === product.id && i.packaging_size === packagingSize
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, {
        product_id: product.id,
        product_name: product.name,
        quantity,
        packaging_size: packagingSize,
        price: product.price_mode === 'fixed' ? product.price : null,
        price_mode: product.price_mode,
        image: product.images?.[0] || '',
        slug: product.slug
      }];
    });
  }, []);

  const removeItem = useCallback((productId, packagingSize) => {
    setItems(prev => prev.filter(i => !(i.product_id === productId && i.packaging_size === packagingSize)));
  }, []);

  const updateQuantity = useCallback((productId, packagingSize, quantity) => {
    if (quantity <= 0) {
      removeItem(productId, packagingSize);
      return;
    }
    setItems(prev => prev.map(i =>
      i.product_id === productId && i.packaging_size === packagingSize
        ? { ...i, quantity }
        : i
    ));
  }, [removeItem]);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

  const estimatedTotal = items.reduce((sum, i) => {
    if (i.price) return sum + (i.price * i.quantity);
    return sum;
  }, 0);

  const hasQuoteItems = items.some(i => !i.price);

  return { items, addItem, removeItem, updateQuantity, clearCart, itemCount, estimatedTotal, hasQuoteItems };
}