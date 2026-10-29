import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Product } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2, Search } from 'lucide-react';
import ProductImageUploader from '@/components/admin/ProductImageUploader';
import { STOCK_STATUS_LABELS, STOCK_STATUS_COLORS, formatPrice } from '@/lib/constants';
import { Category } from '@/lib/entities';
import { toast } from 'sonner';
import { removeUploadedFiles } from '@/lib/storage';
import { useAuth } from '@/lib/AuthContext';

const EMPTY_PRODUCT = {
  name: '', slug: '', sku: '', brand: '', category_id: '', short_description: '', technical_description: '',
  applications: '', grade: '', purity: '', country_of_origin: '', packaging_sizes: [],
  minimum_order_qty: 1, price_mode: 'quote', price: 0, price_min: 0, price_max: 0,
  stock_status: 'in_stock', images: [], tags: [], is_featured: false, is_active: true,
  seo_title: '', seo_description: '', supplier_name: '', cost_price: 0, warehouse_location: '',
  machine_type: '', production_capacity: '', stock_quantity: 0, low_stock_threshold: 5,
  allow_backorders: false, product_type: 'physical', specifications: []
};

// Keep writes aligned with the writable columns granted by migration 0005.
// Catalog metadata such as id and timestamps must never be sent back on edit.
const PRODUCT_WRITE_FIELDS = new Set([
  ...Object.keys(EMPTY_PRODUCT), 'available_colors', 'sds_url', 'tds_url',
]);

class ProductReadBackError extends Error {
  constructor(productId, cause) {
    super(`Product ${productId} was written, but a fresh read failed. Reload the product list before retrying.`);
    this.name = 'ProductReadBackError';
    this.productWriteConfirmed = true;
    this.cause = cause;
  }
}

function productWritePayload(form, slug) {
  return Object.fromEntries(
    Object.entries({ ...form, slug }).filter(([key]) => PRODUCT_WRITE_FIELDS.has(key)),
  );
}

export default function AdminProducts() {
  const { id } = useParams(); const navigate = useNavigate(); const location = useLocation();
  const { profile } = useAuth();
  const [search, setSearch] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_PRODUCT);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [imagesUploading, setImagesUploading] = useState(false);
  const pendingUploads = useRef([]);
  const queryClient = useQueryClient();

  const { data: products = [], isLoading, isError: productsError } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => Product.list('-created_date', 200),
  });
  const { data: categories = [], isError: categoriesError } = useQuery({ queryKey: ['admin-categories'], queryFn: () => Category.list('sort_order', 100) });
  useEffect(() => {
    if (location.pathname.endsWith('/new')) { setEditing(null); setForm(EMPTY_PRODUCT); setDialogOpen(true); return; }
    if (id && products.length) { const product = products.find(p => p.id === id); if (product) { setEditing(product); setForm({ ...EMPTY_PRODUCT, ...product }); setDialogOpen(true); } }
  }, [id, location.pathname, products]);

  const saveMutation = useMutation({
    mutationFn: /** @param {Record<string, any>} data */ async (data) => {
      const write = editing
        ? await Product.update(editing.id, data)
        : await Product.create(data);
      try {
        return await Product.get(write.id);
      } catch (error) {
        throw new ProductReadBackError(write.id, error);
      }
    },
    onSuccess: () => {
      pendingUploads.current = [];
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['featured-products'] });
      queryClient.invalidateQueries({ queryKey: ['all-products-home'] });
      setDialogOpen(false);
      navigate('/admin/products');
      toast.success(editing ? 'Product updated' : 'Product created');
    },
    onError: async (error) => {
      if (error instanceof ProductReadBackError) {
        // The write returned an id, so keep those uploaded objects: the saved
        // product may already reference them even though read-back failed.
        pendingUploads.current = [];
        queryClient.invalidateQueries({ queryKey: ['admin-products'] });
        queryClient.invalidateQueries({ queryKey: ['products'] });
        queryClient.invalidateQueries({ queryKey: ['featured-products'] });
        queryClient.invalidateQueries({ queryKey: ['all-products-home'] });
        setDialogOpen(false);
        navigate('/admin/products');
        toast.error(error.message);
        return;
      }
      const failedUploads = pendingUploads.current;
      if (failedUploads.length) {
        try {
          await removeUploadedFiles(failedUploads.map(file => file.path));
          const failedUrls = new Set(failedUploads.map(file => file.url));
          setForm(current => ({ ...current, images: current.images.filter(url => !failedUrls.has(url)) }));
          pendingUploads.current = [];
        } catch (cleanupError) {
          console.error('Product image cleanup failed after product write failure.', cleanupError);
          toast.error('Product was not saved, and uploaded image cleanup failed. Retry saving or remove the new images before closing.');
          return;
        }
      }
      toast.error(error.message || 'Unable to save product. Please try again.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Product.update(id, { is_active: false, deleted_at: new Date().toISOString() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-products'] });
      setDeleteTarget(null);
      toast.success('Product archived');
    },
  });

  const openCreate = () => { setEditing(null); setForm(EMPTY_PRODUCT); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm({ ...EMPTY_PRODUCT, ...p }); setDialogOpen(true); };
  const updateField = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSave = () => {
    const name = form.name.trim();
    if (!name) { toast.error('Enter a product name.'); return; }
    if (!form.category_id) { toast.error('Select a product category.'); return; }
    if (form.price_mode === 'fixed' && (!Number.isFinite(Number(form.price)) || Number(form.price) < 0)) { toast.error('Enter a valid non-negative price.'); return; }
    if (form.price_mode === 'range' && (!Number.isFinite(Number(form.price_min)) || !Number.isFinite(Number(form.price_max)) || Number(form.price_min) < 0 || Number(form.price_max) < Number(form.price_min))) { toast.error('Enter a valid price range.'); return; }
    const slug = (form.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-')).replace(/^-|-$/g, '');
    if (!slug) { toast.error('Enter a valid product slug.'); return; }
    saveMutation.mutate(productWritePayload({ ...form, name }, slug));
  };

  const handleDialogOpenChange = async (open) => {
    if (!open && (imagesUploading || saveMutation.isPending)) return;
    if (!open && pendingUploads.current.length) {
      const uploads = pendingUploads.current;
      try {
        await removeUploadedFiles(uploads.map(file => file.path));
        const urls = new Set(uploads.map(file => file.url));
        setForm(current => ({ ...current, images: current.images.filter(url => !urls.has(url)) }));
        pendingUploads.current = [];
      } catch (error) {
        console.error('Product image cleanup failed when closing the editor.', error);
        toast.error('New images could not be removed from storage. Keep the editor open and retry, or save the product first.');
        return;
      }
    }
    setDialogOpen(open);
    if (!open && location.pathname !== '/admin/products') navigate('/admin/products');
  };

  const filtered = products.filter(p => !search || [p.name, p.sku, p.category_id].some(v => v?.toLowerCase().includes(search.toLowerCase())));

  if (!profile || profile.is_disabled || !['admin', 'super_admin'].includes(profile.role)) {
    return <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">Product management requires an administrator account. Contact an administrator to update your access.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <h1 className="font-heading text-xl sm:text-2xl font-bold">Products</h1>
        <Button asChild className="gap-1.5 text-sm"><Link to="/admin/products/new"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">Add </span>Product</Link></Button>
      </div>

      {(productsError || categoriesError) && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{productsError ? 'Unable to load products. Check your admin database access and migrations.' : 'Unable to load categories. Check your database access.'}</p>}

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search products..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Desktop table */}
      <Card className="hidden md:block">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-3">Product</th><th className="p-3">SKU</th>
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
                    <td className="p-3 font-mono text-xs">{p.sku || '—'}</td><td className="p-3 text-muted-foreground capitalize">{p.category_id?.replace(/-/g, ' ')}</td>
                    <td className="p-3">
                      {p.price_mode === 'fixed' ? formatPrice(p.price) : p.price_mode === 'range' ? `${formatPrice(p.price_min)}–${formatPrice(p.price_max)}` : 'Quote'}
                    </td>
                    <td className="p-3">
                      <Badge className={`text-xs ${STOCK_STATUS_COLORS[p.stock_status]}`}>{STOCK_STATUS_LABELS[p.stock_status]}</Badge>
                    </td>
                    <td className="p-3">{p.is_featured ? <Badge className="bg-accent text-accent-foreground text-xs">Yes</Badge> : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Link to={`/admin/products/${p.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button></Link>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(p)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{isLoading ? 'Loading...' : productsError ? 'Products could not be loaded.' : 'No products found'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Mobile card list */}
      <div className="md:hidden space-y-3">
        {filtered.map(p => (
          <Card key={p.id}>
            <CardContent className="p-3">
              <div className="flex items-start gap-3">
                {p.images?.[0] && (
                  <img src={p.images[0]} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm line-clamp-1">{p.name}</p>
                  <p className="text-xs text-muted-foreground capitalize mt-0.5">{p.category_id?.replace(/-/g, ' ')}</p>
                  <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                    <Badge className={`text-xs ${STOCK_STATUS_COLORS[p.stock_status]}`}>{STOCK_STATUS_LABELS[p.stock_status]}</Badge>
                    {p.is_featured && <Badge className="bg-accent text-accent-foreground text-xs">Featured</Badge>}
                  </div>
                  <p className="text-xs font-medium mt-1">
                    {p.price_mode === 'fixed' ? formatPrice(p.price) : p.price_mode === 'range' ? `${formatPrice(p.price_min)}–${formatPrice(p.price_max)}` : 'Quote'}
                  </p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <Link to={`/admin/products/${p.id}/edit`}><Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="h-4 w-4" /></Button></Link>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(p)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">{isLoading ? 'Loading...' : productsError ? 'Products could not be loaded.' : 'No products found'}</div>
        )}
      </div>

      {/* Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Edit Product' : 'Create Product'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Product Name *</Label><Input value={form.name} onChange={e => updateField('name', e.target.value)} /></div>
              <div><Label>SKU</Label><Input value={form.sku} onChange={e => updateField('sku', e.target.value)} /></div>
              <div><Label>Slug</Label><Input value={form.slug} onChange={e => updateField('slug', e.target.value)} placeholder="auto-generated" /></div>
              <div><Label>Brand</Label><Input value={form.brand} onChange={e => updateField('brand', e.target.value)} /></div>
              <div>
                <Label>Category *</Label>
                <Select value={form.category_id} onValueChange={v => updateField('category_id', v)}>
                  <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                  <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.slug}>{c.name}</SelectItem>)}</SelectContent>
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
            <div className="grid sm:grid-cols-3 gap-4"><div><Label>Product Type</Label><Select value={form.product_type} onValueChange={v => updateField('product_type', v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="physical">Physical Product</SelectItem><SelectItem value="service">Service</SelectItem><SelectItem value="quote_only">Quote Only</SelectItem></SelectContent></Select></div><div><Label>Stock Quantity</Label><Input type="number" value={form.stock_quantity} onChange={e => updateField('stock_quantity', Number(e.target.value))}/></div><div><Label>Low Stock Threshold</Label><Input type="number" value={form.low_stock_threshold} onChange={e => updateField('low_stock_threshold', Number(e.target.value))}/></div></div>
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
            <div>
              <Label>Available Colors (comma sep.)</Label>
              <Input
                placeholder="e.g. White, Black, Red, Blue, Natural, Transparent"
                value={form.available_colors?.join(', ') || ''}
                onChange={e => updateField('available_colors', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              />
              <p className="text-xs text-muted-foreground mt-1">Leave empty if product has no color variants</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div><Label>Supplier Name</Label><Input value={form.supplier_name} onChange={e => updateField('supplier_name', e.target.value)} /></div>
              <div><Label>Cost Price (hidden)</Label><Input type="number" value={form.cost_price} onChange={e => updateField('cost_price', Number(e.target.value))} /></div>
            </div>
            <ProductImageUploader
              images={form.images || []}
              onChange={v => updateField('images', v)}
              onUploadingChange={setImagesUploading}
              onPendingUploadsChange={files => { pendingUploads.current = [...pendingUploads.current, ...files]; }}
            />
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
            <Button className="w-full" onClick={handleSave} disabled={saveMutation.isPending || imagesUploading || !form.name || !form.category_id}>
              {imagesUploading ? 'Uploading image...' : saveMutation.isPending ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent><DialogHeader><DialogTitle>Archive product?</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">“{deleteTarget?.name}” will be removed from the storefront. Historical order references remain available.</p>
          <DialogFooter><Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button><Button variant="destructive" disabled={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteTarget.id)}>{deleteMutation.isPending ? 'Archiving…' : 'Archive product'}</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
