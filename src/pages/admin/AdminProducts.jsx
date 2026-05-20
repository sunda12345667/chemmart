import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search, Archive } from 'lucide-react';
import { STOCK_STATUS_LABELS, STOCK_STATUS_COLORS, formatPrice } from '@/lib/constants';
import { toast } from 'sonner';

const CATEGORIES = [
  { slug: 'chemicals', name: 'Chemicals' },
  { slug: 'plastic-raw-materials', name: 'Plastic Raw Materials' },
  { slug: 'production-machines', name: 'Production Machines' },
  { slug: 'packaging-materials', name: 'Packaging Materials' },
  { slug: 'cleaning-chemical-raw-materials', name: 'Cleaning Chemicals' },
  { slug: 'additives', name: 'Additives' },
  { slug: 'recycled-materials', name: 'Recycled Materials' },
  { slug: 'spare-parts', name: 'Spare Parts' },
];

const EMPTY_PRODUCT = {
  name: '', slug: '', category_id: '', short_description: '', technical_description: '',
  applications: '', grade: '', purity: '', country_of_origin: '', packaging_sizes: [],
  minimum_order_qty: 1, price_mode: 'quote', price: 0, price_min: 0, price_max: 0,
  stock_status: 'in_stock', images: [], tags: [], is_featured: false, is_active: true,
  seo_title: '', seo_description: '', supplier_name: '', cost_price: 0, warehouse_location: '',
  machine_type: '', production_capacity: ''
};

export default function AdminProducts() {
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) {
        await base44.entities.Product.update(editing.id, data);
      } else {
        await base44.entities.Product.create(data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDialogOpen(false);
      toast.success(editing ? 'Product updated' : 'Product created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Product.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      toast.success('Product deleted');
    },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_PRODUCT); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY_PRODUCT, ...p }); setDialogOpen(true); };
  const updateField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    saveMutation.mutate({ ...form, slug });
  };

  const filtered = products.filter(p =>
    !search || p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Products</h1>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Add Product</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-3">Product</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Stock</th>
                  <th className="p-3">Featured</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        {p.images?.[0] && (
                          <img src={p.images[0]} alt="" className="w-10 h-10 rounded-md object-cover" />
                        )}
                        <div>
                          <p className="font-medium">{p.name}</p>
                          {p.grade && <p className="text-xs text-muted-foreground">Grade: {p.grade}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 text-muted-foreground capitalize">{p.category_id?.replace(/-/g, ' ')}</td>
                    <td className="p-3">
                      {p.price_mode === 'fixed' ? formatPrice(p.price) : p.price_mode === 'range' ? `${formatPrice(p.price_min)}–${formatPrice(p.price_max)}` : 'Quote'}
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${STOCK_STATUS_COLORS[p.stock_status]}`}>{STOCK_STATUS_LABELS[p.stock_status]}</Badge>
                    </td>
                    <td className="p-3">{p.is_featured ? <Badge className="bg-accent text-accent-foreground text-xs">Yes</Badge> : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">{isLoading ? 'Loading...' : 'No products found'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Product Name *</Label><Input value={form.name} onChange={e => updateField('name', e.target.value)} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="auto-generated" /></div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category_id} onValueChange={v => updateField('category_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(c => <SelectItem key={c.slug} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stock Status</Label>
                <Select value={form.stock_status} onValueChange={v => updateField('stock_status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="in_stock">In Stock</SelectItem>
                    <SelectItem value="low_stock">Low Stock</SelectItem>
                    <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    <SelectItem value="pre_order">Pre-Order</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Short Description</Label><Textarea value={form.short_description} onChange={e => updateField('short_description', e.target.value)} rows={2} /></div>
            <div><Label>Technical Description</Label><Textarea value={form.technical_description} onChange={e => updateField('technical_description', e.target.value)} rows={3} /></div>
            <div><Label>Applications</Label><Textarea value={form.applications} onChange={e => updateField('applications', e.target.value)} rows={2} /></div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div><Label>Grade</Label><Input value={form.grade} onChange={e => updateField('grade', e.target.value)} /></div>
              <div><Label>Purity</Label><Input value={form.purity} onChange={e => updateField('purity', e.target.value)} /></div>
              <div><Label>Origin Country</Label><Input value={form.country_of_origin} onChange={e => updateField('country_of_origin', e.target.value)} /></div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              <div>
                <Label>Price Mode</Label>
                <Select value={form.price_mode} onValueChange={v => updateField('price_mode', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed">Fixed Price</SelectItem>
                    <SelectItem value="range">Price Range</SelectItem>
                    <SelectItem value="quote">Request Quote</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.price_mode === 'fixed' && (
                <div><Label>Price (₦)</Label><Input type="number" value={form.price} onChange={e => updateField('price', Number(e.target.value))} /></div>
              )}
              {form.price_mode === 'range' && (
                <>
                  <div><Label>Min Price (₦)</Label><Input type="number" value={form.price_min} onChange={e => updateField('price_min', Number(e.target.value))} /></div>
                  <div><Label>Max Price (₦)</Label><Input type="number" value={form.price_max} onChange={e => updateField('price_max', Number(e.target.value))} /></div>
                </>
              )}
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>MOQ</Label><Input type="number" value={form.minimum_order_qty} onChange={e => updateField('minimum_order_qty', Number(e.target.value))} /></div>
              <div><Label>Packaging Sizes (comma sep.)</Label><Input value={form.packaging_sizes?.join(', ')} onChange={e => updateField('packaging_sizes', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Supplier Name</Label><Input value={form.supplier_name} onChange={e => updateField('supplier_name', e.target.value)} /></div>
              <div><Label>Cost Price (hidden)</Label><Input type="number" value={form.cost_price} onChange={e => updateField('cost_price', Number(e.target.value))} /></div>
            </div>
            <div><Label>Image URLs (comma sep.)</Label><Input value={form.images?.join(', ')} onChange={e => updateField('images', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></div>
            <div><Label>Tags (comma sep.)</Label><Input value={form.tags?.join(', ')} onChange={e => updateField('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} /></div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <Switch checked={form.is_featured} onCheckedChange={v => updateField('is_featured', v)} />
                <Label>Featured</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.is_active} onCheckedChange={v => updateField('is_active', v)} />
                <Label>Active</Label>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>SEO Title</Label><Input value={form.seo_title} onChange={e => updateField('seo_title', e.target.value)} /></div>
              <div><Label>SEO Description</Label><Input value={form.seo_description} onChange={e => updateField('seo_description', e.target.value)} /></div>
            </div>
            <Button className="w-full" onClick={handleSave} disabled={saveMutation.isPending || !form.name || !form.category_id}>
              {saveMutation.isPending ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}