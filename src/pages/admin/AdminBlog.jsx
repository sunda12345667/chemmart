import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminBlog() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', slug: '', excerpt: '', content: '', cover_image: '', category: 'buying_guide', is_published: false, seo_title: '', seo_description: '' });
  const queryClient = useQueryClient();

  const { data: posts = [] } = useQuery({
    queryKey: ['admin-blog'],
    queryFn: () => base44.entities.BlogPost.list('-created_date', 100),
    initialData: [],
  });

  const saveMutation = useMutation({
    mutationFn: async (data) => {
      if (editing) return base44.entities.BlogPost.update(editing.id, data);
      return base44.entities.BlogPost.create(data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      setDialogOpen(false);
      toast.success(editing ? 'Post updated' : 'Post created');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.BlogPost.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-blog'] });
      toast.success('Post deleted');
    },
  });

  const openCreate = () => { setEditing(null); setForm({ title: '', slug: '', excerpt: '', content: '', cover_image: '', category: 'buying_guide', is_published: false }); setDialogOpen(true); };
  const openEdit = (p) => { setEditing(p); setForm(p); setDialogOpen(true); };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-2xl font-bold">Blog Posts</h1>
        <Button onClick={openCreate} className="gap-1.5"><Plus className="h-4 w-4" /> New Post</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {posts.map(p => (
                  <tr key={p.id} className="hover:bg-muted/30">
                    <td className="p-3 font-medium">{p.title}</td>
                    <td className="p-3 capitalize text-muted-foreground">{p.category?.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <Badge className={p.is_published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                        {p.is_published ? 'Published' : 'Draft'}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{p.created_date ? new Date(p.created_date).toLocaleDateString() : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(p.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {posts.length === 0 && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No posts yet</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit Post' : 'New Post'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Title *</Label><Input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} /></div>
            <div><Label>Slug</Label><Input value={form.slug} onChange={e => setForm(p => ({ ...p, slug: e.target.value }))} placeholder="auto-generated" /></div>
            <div>
              <Label>Category</Label>
              <Select value={form.category} onValueChange={v => setForm(p => ({ ...p, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="buying_guide">Buying Guide</SelectItem>
                  <SelectItem value="industry_news">Industry News</SelectItem>
                  <SelectItem value="product_comparison">Product Comparison</SelectItem>
                  <SelectItem value="application_guide">Application Guide</SelectItem>
                  <SelectItem value="safety_tips">Safety Tips</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div><Label>Excerpt</Label><Textarea value={form.excerpt} onChange={e => setForm(p => ({ ...p, excerpt: e.target.value }))} rows={2} /></div>
            <div><Label>Content *</Label><Textarea value={form.content} onChange={e => setForm(p => ({ ...p, content: e.target.value }))} rows={10} /></div>
            <div><Label>Cover Image URL</Label><Input value={form.cover_image} onChange={e => setForm(p => ({ ...p, cover_image: e.target.value }))} /></div>
            <div className="flex items-center gap-2"><Switch checked={form.is_published} onCheckedChange={v => setForm(p => ({ ...p, is_published: v }))} /><Label>Published</Label></div>
            <Button className="w-full" onClick={() => {
              const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              saveMutation.mutate({ ...form, slug });
            }} disabled={!form.title}>
              {saveMutation.isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}