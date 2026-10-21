import React, { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Edit, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';

const CONFIG = {
  inventory: { title: 'Inventory', table: 'products', readTable: 'product_catalog', columns: ['name','sku','stock_quantity','low_stock_threshold','stock_status','updated_at'], edit: ['stock_quantity','low_stock_threshold','allow_backorders'] },
  orders: { title: 'Orders', table: 'orders', columns: ['order_number','customer_name','total','payment_status','order_status','created_at'], edit: ['order_status','payment_status','admin_notes'] },
  customers: { title: 'Customers', table: 'profiles', columns: ['full_name','email','phone','role','is_disabled','created_at'], edit: ['is_disabled'] },
  services: { title: 'Services', table: 'services', columns: ['name','category','is_active','created_at'], edit: ['name','slug','category','description','image_url','is_active'], create: ['name','slug','category','description','image_url','is_active'] },
  'service-requests': { title: 'Service Requests', table: 'service_requests', columns: ['request_number','customer_name','service_name','location','status','created_at'], edit: ['status','assigned_to','internal_notes'] },
  quotes: { title: 'Quote Requests', table: 'quotes', columns: ['quote_number','customer_name','total','status','valid_until','created_at'], edit: ['status','notes','valid_until'], create: ['quote_number','customer_name','customer_email','customer_phone','total','notes','valid_until','status'] },
  invoices: { title: 'Invoices', table: 'quotes', columns: ['quote_number','customer_name','total','status','created_at'], edit: ['status'] },
  media: { title: 'Media', table: 'products', columns: ['name','images','created_date'], edit: [] },
  content: { title: 'Website Content', table: 'company_settings', columns: ['company_name','content','updated_at'], edit: ['company_name','content'] },
  settings: { title: 'Company Settings', table: 'company_settings', columns: ['company_name','email','phone','whatsapp','currency','updated_at'], edit: ['company_name','logo_url','email','phone','whatsapp','address','business_hours','currency','tax_rate','social_links'] },
  users: { title: 'Admin Users', table: 'profiles', columns: ['full_name','email','role','is_disabled','created_at'], edit: ['full_name','phone','role','is_disabled'] },
  'audit-logs': { title: 'Audit Logs', table: 'audit_logs', columns: ['action','entity_type','entity_id','created_at'], edit: [] },
};
const choices = { order_status: ['pending','confirmed','processing','ready_for_delivery','shipped','delivered','cancelled'], payment_status: ['pending','paid','failed','refunded'], status: ['new','under_review','contacted','in_progress','completed','cancelled','draft','sent','accepted','rejected'], role: ['user','staff','admin','super_admin'], currency: ['NGN'] };
const format = (value) => { if (value === null || value === undefined || value === '') return '—'; if (typeof value === 'boolean') return value ? 'Yes' : 'No'; if (typeof value === 'object') return Array.isArray(value) ? `${value.length} item(s)` : 'Configured'; return String(value); };
const titleize = field => field.replaceAll('_',' ').replace(/\b\w/g, letter => letter.toUpperCase());
const makeQuote = () => `AMT-Q-${String(Date.now()).slice(-6)}`;

export default function DataTablePage({ type }) {
  const config = CONFIG[type]; const queryClient = useQueryClient(); const [search, setSearch] = useState(''); const [editing, setEditing] = useState(null); const [form, setForm] = useState(/** @type {Record<string, any>} */ ({}));
  const orderColumn = config.columns.includes('created_at') ? 'created_at' : config.columns.includes('updated_at') ? 'updated_at' : 'created_date';
  const { data = [], isLoading, error } = useQuery({ queryKey: ['admin', config.table], queryFn: async () => { const { data, error } = await supabase.from(config.readTable || config.table).select('*').order(orderColumn, { ascending: false }).limit(100); if (error) throw error; return data; } });
  const save = useMutation({ mutationFn: async () => {
    const payload = { ...form };
    fields.forEach(key => {
      if (key === 'tax_rate' || key === 'total') payload[key] = Number(payload[key] || 0);
      if (key === 'content' || key === 'social_links') {
        try { payload[key] = payload[key] ? JSON.parse(payload[key]) : {}; }
        catch { throw new Error(`${titleize(key)} must be valid JSON.`); }
      }
    });
    if (editing?.id) { const { error } = await supabase.from(config.table).update(payload).eq('id', editing.id); if (error) throw error; }
    else { if (config.table === 'quotes' && !payload.quote_number) payload.quote_number = makeQuote(); const { error } = await supabase.from(config.table).insert(payload); if (error) throw error; }
  }, onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin', config.table] }); queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] }); setEditing(null); toast.success('Changes saved successfully.'); }, onError: err => toast.error(err.message || 'Unable to save changes. Please try again.') });
  const rows = useMemo(() => data.filter(row => !search || config.columns.some(key => String(row[key] || '').toLowerCase().includes(search.toLowerCase()))), [data, search, config.columns]);
  const open = row => { setEditing(row || {}); const next = {}; (row ? config.edit : config.create || []).forEach(key => { const value = row?.[key]; next[key] = ['content','social_links'].includes(key) && value && typeof value === 'object' ? JSON.stringify(value, null, 2) : value ?? (key === 'is_active' ? true : key === 'is_disabled' ? false : key === 'quote_number' ? makeQuote() : ''); }); setForm(next); };
  const fields = editing?.id ? config.edit : config.create || [];
  return <div className="space-y-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><h1 className="font-heading text-2xl font-bold">{config.title}</h1><p className="text-sm text-muted-foreground">Live data from the AMTECH database.</p></div>{config.create && <Button onClick={() => open(null)}><Plus className="mr-2 h-4 w-4"/>Add {config.title === 'Services' ? 'Service' : 'Quote'}</Button>}</div><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"/><Input className="pl-9" placeholder={`Search ${config.title.toLowerCase()}…`} value={search} onChange={e => setSearch(e.target.value)}/></div><Card><CardContent className="p-0"><div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b bg-muted/50 text-left">{config.columns.map(column => <th className="p-3" key={column}>{titleize(column)}</th>)}{config.edit.length > 0 && <th className="p-3">Actions</th>}</tr></thead><tbody className="divide-y">{rows.map(row => <tr key={row.id} className="hover:bg-muted/30">{config.columns.map(column => <td className="max-w-52 truncate p-3" key={column}>{format(row[column])}</td>)}{config.edit.length > 0 && <td className="p-3"><Button variant="ghost" size="icon" aria-label={`Edit ${config.title}`} onClick={() => open(row)}><Edit className="h-4 w-4"/></Button></td>}</tr>)}{!rows.length && <tr><td colSpan={config.columns.length + 1} className="p-10 text-center text-muted-foreground">{isLoading ? `Loading ${config.title.toLowerCase()}…` : error ? 'Unable to load records. Please check your database access.' : `No ${config.title.toLowerCase()} yet.`}</td></tr>}</tbody></table></div></CardContent></Card><Dialog open={!!editing} onOpenChange={openState => !openState && setEditing(null)}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing?.id ? `Edit ${config.title.slice(0, -1)}` : `Create ${config.title.slice(0, -1)}`}</DialogTitle></DialogHeader><div className="space-y-4">{fields.map(field => <Field key={field} field={field} value={form[field]} onChange={value => setForm(current => ({ ...current, [field]: value }))}/>)}</div><DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button disabled={save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save changes'}</Button></DialogFooter></DialogContent></Dialog></div>;
}
function Field({ field, value, onChange }) { if (typeof value === 'boolean') return <div className="flex items-center justify-between"><Label>{titleize(field)}</Label><Switch checked={value} onCheckedChange={onChange}/></div>; if (choices[field]) return <div><Label>{titleize(field)}</Label><Select value={value || choices[field][0]} onValueChange={onChange}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent>{choices[field].map(option => <SelectItem value={option} key={option}>{titleize(option)}</SelectItem>)}</SelectContent></Select></div>; if (['description','notes','internal_notes','content','social_links'].includes(field)) return <div><Label>{titleize(field)}</Label><Textarea rows={field === 'content' || field === 'social_links' ? 8 : 3} value={value || ''} onChange={e => onChange(e.target.value)}/></div>; return <div><Label>{titleize(field)}</Label><Input type={['stock_quantity','low_stock_threshold','tax_rate','total'].includes(field) ? 'number' : field === 'valid_until' ? 'date' : 'text'} value={value ?? ''} onChange={e => onChange(e.target.value)}/></div>; }
