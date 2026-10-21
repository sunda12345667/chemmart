import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Category } from '@/lib/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import SingleImageUploader from '@/components/admin/SingleImageUploader';

export default function AdminCategories() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '', image_url: '', is_active: true, seo_title: '', seo_description: '' });
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => Category.list('sort_order', 100),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: /** @param {Record<string, any>} data */ async (data) => {
      if (editing) return Category.update(editing.id, data);
      return Category.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setDialogOpen(false);
      toast.success(editing ? 'Category updated' : 'Category created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => Category.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      toast.success('Category deleted');
    },
  });

  const openCreate = () => { setEditing(null); setForm({ name: '', slug: '', description: '', image_url: '', is_active: true, seo_title: '', seo_description: '' }); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm(c); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Categories</h1>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> Add Category</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-3">Name</th>
                  <th className="p-3">Slug</th>
                  <th className="p-3">Active</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {categories.map(c => (
                  <tr key={c.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{c.name}</td>
                    <td className="p-3 text-muted-foreground font-mono text-xs">{c.slug}</td>
                    <td className="p-3">{c.is_active !== false ? '✓' : '✗'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(c)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(c.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {categories.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No categories yet</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? 'Edit Category' : 'Create Category'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Name *</Label><Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} /></div>
            <div><Label>Slug *</Label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" /></div>
            <div><Label>Description</Label><Textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={2} /></div>
            <SingleImageUploader label="Category Image" imageUrl={form.image_url || ''} onChange={v => setForm(p => ({ ...p, image_url: v }))} />
            <div className="flex items-center gap-2"><Switch checked={form.is_active !== false} onCheckedChange={v => setForm(p => ({ ...p, is_active: v }))} /><Label>Active</Label></div>
            <Button className="w-full" onClick={() => {
              const slug = form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              saveMutation.mutate({ ...form, slug });
            }} disabled={!form.name}>
              {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}