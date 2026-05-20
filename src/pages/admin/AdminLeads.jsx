import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Eye, Phone } from 'lucide-react';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, formatPrice } from '@/lib/constants';
import { toast } from 'sonner';

export default function AdminLeads() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedLead, setSelectedLead] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newNote, setNewNote] = useState('');
  const queryClient = useQueryClient();

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 200),
    initialData: [],
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Lead.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-leads'] });
      toast.success('Lead updated');
    },
  });

  const filtered = typeFilter === 'all' ? leads : leads.filter(l => l.type === typeFilter);

  const handleStatusChange = (lead, status) => {
    const log = [...(lead.activity_log || []), { action: `Status changed to ${status}`, date: new Date().toISOString() }];
    updateMutation.mutate({ id: lead.id, data: { status, activity_log: log } });
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedLead) return;
    const log = [...(selectedLead.activity_log || []), { action: `Note: ${newNote}`, date: new Date().toISOString() }];
    const notes = selectedLead.internal_notes ? `${selectedLead.internal_notes}\n${newNote}` : newNote;
    updateMutation.mutate({ id: selectedLead.id, data: { internal_notes: notes, activity_log: log } });
    setNewNote('');
    setSelectedLead(prev => ({ ...prev, internal_notes: notes, activity_log: log }));
  };

  const getWhatsAppFollowup = (lead) => {
    const msg = `Hello ${lead.customer_name}, this is ChemMart.ng following up on your ${lead.type?.replace(/_/g, ' ')} (Ref: ${lead.reference_id || '—'}). How can we help you today?`;
    return `https://wa.me/${lead.customer_phone?.replace(/^0/, '234')}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Leads & Orders</h1>

      <Tabs defaultValue="all" onValueChange={setTypeFilter}>
        <TabsList className="flex-wrap h-auto gap-1">
          <TabsTrigger value="all">All ({leads.length})</TabsTrigger>
          <TabsTrigger value="whatsapp_checkout">Orders ({leads.filter(l => l.type === 'whatsapp_checkout').length})</TabsTrigger>
          <TabsTrigger value="bulk_quote">Quotes ({leads.filter(l => l.type === 'bulk_quote').length})</TabsTrigger>
          <TabsTrigger value="technical_inquiry">Technical ({leads.filter(l => l.type === 'technical_inquiry').length})</TabsTrigger>
          <TabsTrigger value="machine_sourcing">Machines ({leads.filter(l => l.type === 'machine_sourcing').length})</TabsTrigger>
          <TabsTrigger value="product_inquiry">Product ({leads.filter(l => l.type === 'product_inquiry').length})</TabsTrigger>
        </TabsList>
      </Tabs>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left bg-muted/50">
                  <th className="p-3">Ref</th>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Total</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs">{lead.reference_id || '—'}</td>
                    <td className="p-3">
                      <p className="font-medium">{lead.customer_name}</p>
                      <p className="text-xs text-muted-foreground">{lead.customer_phone}</p>
                    </td>
                    <td className="p-3 capitalize text-xs">{lead.type?.replace(/_/g, ' ')}</td>
                    <td className="p-3">
                      <Select value={lead.status} onValueChange={(v) => handleStatusChange(lead, v)}>
                        <SelectTrigger className="h-7 text-xs w-28">
                          <Badge className={`text-xs ${LEAD_STATUS_COLORS[lead.status]}`}>{LEAD_STATUS_LABELS[lead.status]}</Badge>
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LEAD_STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">{lead.estimated_total ? formatPrice(lead.estimated_total) : '—'}</td>
                    <td className="p-3 text-muted-foreground text-xs">{lead.created_date ? new Date(lead.created_date).toLocaleDateString() : '—'}</td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setSelectedLead(lead)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {lead.customer_phone && (
                          <a href={getWhatsAppFollowup(lead)} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="icon" className="h-7 w-7 text-whatsapp">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">{isLoading ? 'Loading...' : 'No leads found'}</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Lead detail dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedLead && (
            <>
              <DialogHeader>
                <DialogTitle>Lead Details — {selectedLead.reference_id}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-muted-foreground">Name:</span> <strong>{selectedLead.customer_name}</strong></div>
                  <div><span className="text-muted-foreground">Phone:</span> <strong>{selectedLead.customer_phone}</strong></div>
                  {selectedLead.customer_email && <div><span className="text-muted-foreground">Email:</span> {selectedLead.customer_email}</div>}
                  {selectedLead.company_name && <div><span className="text-muted-foreground">Company:</span> {selectedLead.company_name}</div>}
                  {selectedLead.delivery_state && <div><span className="text-muted-foreground">Location:</span> {selectedLead.delivery_city}, {selectedLead.delivery_state}</div>}
                </div>

                {selectedLead.items?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-sm mb-2">Order Items</h4>
                    {selectedLead.items.map((item, i) => (
                      <div key={i} className="flex justify-between text-sm py-1.5 border-b last:border-0">
                        <span>{item.product_name} × {item.quantity} {item.packaging_size && `(${item.packaging_size})`}</span>
                        <span>{item.price ? formatPrice(item.price * item.quantity) : 'Quote'}</span>
                      </div>
                    ))}
                  </div>
                )}

                {selectedLead.notes && (
                  <div><h4 className="font-semibold text-sm mb-1">Customer Notes</h4><p className="text-sm text-muted-foreground">{selectedLead.notes}</p></div>
                )}

                {/* Activity log */}
                <div>
                  <h4 className="font-semibold text-sm mb-2">Activity Timeline</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {(selectedLead.activity_log || []).map((log, i) => (
                      <div key={i} className="text-xs flex gap-2">
                        <span className="text-muted-foreground whitespace-nowrap">{log.date ? new Date(log.date).toLocaleString() : ''}</span>
                        <span>{log.action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add note */}
                <div>
                  <Label>Add Internal Note</Label>
                  <div className="flex gap-2 mt-1">
                    <Textarea value={newNote} onChange={e => setNewNote(e.target.value)} rows={2} className="flex-1" />
                    <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>Add</Button>
                  </div>
                </div>

                {/* WhatsApp followup */}
                {selectedLead.customer_phone && (
                  <a href={getWhatsAppFollowup(selectedLead)} target="_blank" rel="noopener noreferrer" className="block">
                    <Button className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white gap-2">
                      <MessageCircle className="h-4 w-4" /> Reply on WhatsApp
                    </Button>
                  </a>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}