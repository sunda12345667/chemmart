import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Boxes, ClipboardList, FileText, Package, ShoppingCart, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '@/lib/constants';

/** @param {string} table @param {Array<[string, string | boolean | null]>} filters */
const total = async (table, filters = []) => {
  // Table names are selected from this file's fixed internal list. Supabase's
  // generic client cannot infer a relation from this dynamic name.
  let query = /** @type {any} */ (supabase.from(table)).select('*', { count: 'exact', head: true });
  filters.forEach(([key, value]) => {
    query = value === null ? query.is(key, null) : query.eq(key, value);
  });
  const { count, error } = await query;
  if (error) throw error;
  return count || 0;
};

export default function AdminDashboard() {
  const { data, isLoading, error } = useQuery({ queryKey: ['admin-dashboard'], refetchInterval: 30000, queryFn: async () => {
    const [products, active, outOfStock, lowStock, orders, pending, completed, customers, services, quotes, paidOrders, lowProducts] = await Promise.all([
      total('product_catalog', [['deleted_at', null]]), total('product_catalog', [['is_active', true], ['deleted_at', null]]), total('product_catalog', [['stock_status', 'out_of_stock'], ['deleted_at', null]]), total('product_catalog', [['stock_status', 'low_stock'], ['deleted_at', null]]),
      total('orders'), total('orders', [['order_status', 'pending']]), total('orders', [['order_status', 'delivered']]), total('profiles', [['role', 'user']]), total('service_requests'), total('quotes'),
      supabase.from('orders').select('total').eq('payment_status', 'paid'), supabase.from('product_catalog').select('id,name,stock_quantity,low_stock_threshold').eq('stock_status', 'low_stock').limit(8)
    ]);
    if (paidOrders.error) throw paidOrders.error; if (lowProducts.error) throw lowProducts.error;
    return { products, active, outOfStock, lowStock, orders, pending, completed, customers, services, quotes, revenue: (paidOrders.data || []).reduce((sum, order) => sum + Number(order.total || 0), 0), lowProducts: lowProducts.data || [] };
  }});
  const cards = [
    { title: 'Total Products', value: data?.products, Icon: Package },
    { title: 'Active Products', value: data?.active, Icon: Package },
    { title: 'Out of Stock', value: data?.outOfStock, Icon: AlertTriangle },
    { title: 'Low Stock', value: data?.lowStock, Icon: Boxes },
    { title: 'Orders', value: data?.orders, Icon: ShoppingCart },
    { title: 'Pending Orders', value: data?.pending, Icon: ClipboardList },
    { title: 'Completed Orders', value: data?.completed, Icon: ShoppingCart },
    { title: 'Customers', value: data?.customers, Icon: Users },
    { title: 'Service Requests', value: data?.services, Icon: ClipboardList },
    { title: 'Quote Requests', value: data?.quotes, Icon: FileText },
  ];
  return <div className="space-y-6"><div><h1 className="font-heading text-2xl font-bold">Dashboard</h1><p className="text-sm text-muted-foreground">Live operational data. Refreshes automatically.</p></div>{error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Unable to load dashboard data. Please verify the database migration and your access.</p>}<div className="grid grid-cols-2 gap-4 xl:grid-cols-5">{cards.map(({ title, value, Icon }) => <Card key={title}><CardContent className="p-4"><div className="mb-2 flex items-center justify-between text-muted-foreground"><span className="text-xs">{title}</span><Icon className="h-4 w-4" /></div><p className="text-2xl font-bold">{isLoading ? 'Loading…' : value ?? 0}</p></CardContent></Card>)}<Card className="col-span-2"><CardContent className="p-4"><span className="text-xs text-muted-foreground">Revenue (paid orders)</span><p className="mt-2 text-2xl font-bold">{isLoading ? 'Loading…' : formatPrice(data?.revenue || 0)}</p></CardContent></Card></div><Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><AlertTriangle className="h-5 w-5 text-amber-600"/>Low stock alert</CardTitle></CardHeader><CardContent>{isLoading ? <p className="text-sm text-muted-foreground">Loading inventory…</p> : data?.lowProducts.length ? <div className="flex flex-wrap gap-2">{data.lowProducts.map(product => <Link key={product.id} to="/admin/inventory"><Badge variant="outline" className="border-amber-300 text-amber-800">{product.name} ({product.stock_quantity})</Badge></Link>)}</div> : <p className="text-sm text-muted-foreground">No low-stock products.</p>}</CardContent></Card></div>;
}
