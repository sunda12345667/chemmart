import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Package, Users, ShoppingCart, AlertTriangle, Eye, TrendingUp } from 'lucide-react';
import { LEAD_STATUS_LABELS, LEAD_STATUS_COLORS, formatPrice } from '@/lib/constants';
import { Link } from 'react-router-dom';

export default function AdminDashboard() {
  const { data: products = [] } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => base44.entities.Product.list('-created_date', 200),
    initialData: [],
  });

  const { data: leads = [] } = useQuery({
    queryKey: ['admin-leads'],
    queryFn: () => base44.entities.Lead.list('-created_date', 200),
    initialData: [],
  });

  const totalProducts = products.length;
  const activeProducts = products.filter(p => p.is_active).length;
  const lowStockProducts = products.filter(p => p.stock_status === 'low_stock');
  const totalLeads = leads.length;
  const newLeads = leads.filter(l => l.status === 'new').length;
  const todayCheckouts = leads.filter(l => {
    const today = new Date().toISOString().split('T')[0];
    return l.type === 'whatsapp_checkout' && l.created_date?.startsWith(today);
  }).length;
  const quoteRequests = leads.filter(l => l.type === 'bulk_quote').length;

  const recentLeads = leads.slice(0, 8);

  return (
    <div className="space-y-6">
      <h1 className="font-heading text-2xl font-bold">Dashboard</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Total Products" value={totalProducts} sub={`${activeProducts} active`} icon={Package} color="text-blue-600 bg-blue-50" />
        <StatCard title="Total Leads" value={totalLeads} sub={`${newLeads} new`} icon={Users} color="text-green-600 bg-green-50" />
        <StatCard title="Today's Orders" value={todayCheckouts} sub="WhatsApp checkouts" icon={ShoppingCart} color="text-purple-600 bg-purple-50" />
        <StatCard title="Quote Requests" value={quoteRequests} sub="Bulk quotes" icon={TrendingUp} color="text-amber-600 bg-amber-50" />
      </div>

      {/* Low stock alert */}
      {lowStockProducts.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-amber-800">
              <AlertTriangle className="h-5 w-5" /> Low Stock Alert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lowStockProducts.map(p => (
                <Link key={p.id} to={`/admin/products`}>
                  <Badge variant="outline" className="cursor-pointer border-amber-300 text-amber-800">{p.name}</Badge>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent leads */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Recent Leads & Orders</CardTitle>
          <Link to="/admin/leads" className="text-sm text-primary hover:underline">View All</Link>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2 pr-4">Ref</th>
                  <th className="pb-2 pr-4">Customer</th>
                  <th className="pb-2 pr-4">Type</th>
                  <th className="pb-2 pr-4">Status</th>
                  <th className="pb-2">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-muted/50">
                    <td className="py-2.5 pr-4 font-mono text-xs">{lead.reference_id || '—'}</td>
                    <td className="py-2.5 pr-4 font-medium">{lead.customer_name}</td>
                    <td className="py-2.5 pr-4 capitalize text-muted-foreground">{lead.type?.replace(/_/g, ' ')}</td>
                    <td className="py-2.5 pr-4">
                      <Badge className={`text-xs ${LEAD_STATUS_COLORS[lead.status] || ''}`}>
                        {LEAD_STATUS_LABELS[lead.status] || lead.status}
                      </Badge>
                    </td>
                    <td className="py-2.5 text-muted-foreground text-xs">
                      {lead.created_date ? new Date(lead.created_date).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
                {recentLeads.length === 0 && (
                  <tr><td colSpan={5} className="py-8 text-center text-muted-foreground">No leads yet</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({ title, value, sub, icon: Icon, color }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className={`p-2 rounded-lg ${color}`}><Icon className="h-4 w-4" /></div>
        </div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
      </CardContent>
    </Card>
  );
}