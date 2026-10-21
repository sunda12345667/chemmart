import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '@/lib/cartStore';
import { formatPrice, generateReferenceId, buildWhatsAppUrl, NIGERIAN_STATES } from '@/lib/constants';
import { submitPublicForm } from '@/lib/publicSubmission';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight, MessageCircle } from 'lucide-react';

export default function Cart() {
  const { items, removeItem, updateQuantity, clearCart, estimatedTotal, hasQuoteItems } = useCart();
  const [step, setStep] = useState('cart'); // cart | checkout
  const [form, setForm] = useState({
    name: '', phone: '', email: '', company: '', state: '', city: '', notes: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const updateForm = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const generateMessage = (refId) => {
    let msg = `📦 *NEW ORDER — AMTECH GLOBAL SOLUTION SERVICES*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;
    msg += `📋 Order Ref: *${refId}*\n\n`;
    msg += `👤 *Customer Details*\n`;
    msg += `Name: ${form.name}\n`;
    msg += `Phone: ${form.phone}\n`;
    if (form.email) msg += `Email: ${form.email}\n`;
    if (form.company) msg += `Company: ${form.company}\n`;
    msg += `📍 Delivery: ${form.city}, ${form.state}\n\n`;
    msg += `🛒 *Order Items*\n`;
    msg += `━━━━━━━━━━━━━━━━━━\n`;

    items.forEach((item, i) => {
      msg += `${i + 1}. *${item.product_name}*\n`;
      msg += `   Qty: ${item.quantity}`;
      if (item.packaging_size) msg += ` | Pack: ${item.packaging_size}`;
      if (item.price) {
        msg += ` | Price: ${formatPrice(item.price * item.quantity)}`;
      } else {
        msg += ` | 💬 *Quote Required*`;
      }
      msg += `\n`;
    });

    msg += `\n━━━━━━━━━━━━━━━━━━\n`;
    if (estimatedTotal > 0) {
      msg += `💰 Estimated Total: *${formatPrice(estimatedTotal)}*\n`;
    }
    if (hasQuoteItems) {
      msg += `⚠️ Some items require price quotation\n`;
    }
    if (form.notes) {
      msg += `\n📝 Notes: ${form.notes}\n`;
    }
    msg += `\nSent via AMTECH GLOBAL SOLUTION SERVICES`;
    return msg;
  };

  const handleCheckout = async () => {
    if (!form.name || !form.phone || !form.state || !form.city) return;

    setSubmitting(true);
    setSubmissionError('');
    const refId = generateReferenceId();
    const message = generateMessage(refId);

    try {
      await submitPublicForm({
      type: 'whatsapp_checkout',
      reference_id: refId,
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email,
      company_name: form.company,
      delivery_state: form.state,
      delivery_city: form.city,
      notes: form.notes,
      items: items.map(i => ({
        product_id: i.product_id,
        product_name: i.product_name,
        quantity: i.quantity,
        packaging_size: i.packaging_size,
        price: i.price,
        is_quote: !i.price
      })),
      estimated_total: estimatedTotal,
      status: 'new',
      whatsapp_message: message,
      activity_log: [{ action: 'Order submitted via WhatsApp', date: new Date().toISOString() }]
      });

      clearCart();

      // This is an enquiry handoff, not a verified online payment/order.
      window.open(buildWhatsAppUrl(message), '_blank', 'noopener,noreferrer');
      setStep('cart');
    } catch (error) {
      setSubmissionError(error.message || 'Unable to submit your enquiry. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && step === 'cart') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Your Cart is Empty</h1>
        <p className="text-muted-foreground mb-6">Browse our products and add items to get started</p>
        <Link to="/products"><Button className="gap-2">Browse Products <ArrowRight className="h-4 w-4" /></Button></Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="font-heading text-2xl md:text-3xl font-bold mb-8">
        {step === 'cart' ? 'Shopping Cart' : 'Complete Your Order'}
      </h1>

      {step === 'cart' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map(item => (
              <Card key={`${item.product_id}-${item.packaging_size}`}>
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    {item.image && (
                      <img src={item.image} alt={item.product_name} className="w-20 h-20 rounded-lg object-cover flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${item.slug || item.product_id}`} className="font-heading font-semibold text-sm hover:text-primary transition-colors line-clamp-1">
                        {item.product_name}
                      </Link>
                      {item.packaging_size && <p className="text-xs text-muted-foreground mt-0.5">Pack: {item.packaging_size}</p>}
                      <div className="mt-2">
                        {item.price ? (
                          <span className="font-bold">{formatPrice(item.price * item.quantity)}</span>
                        ) : (
                          <span className="text-sm font-medium text-primary">Quote Required</span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => removeItem(item.product_id, item.packaging_size)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <div className="flex items-center gap-1 border rounded-lg">
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, item.packaging_size, item.quantity - 1)}>
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => updateQuantity(item.product_id, item.packaging_size, item.quantity + 1)}>
                          <Plus className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Summary */}
          <Card className="h-fit lg:sticky lg:top-36">
            <CardHeader><CardTitle>Order Summary</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {submissionError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submissionError}</p>}
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Items ({items.length})</span>
                <span>{estimatedTotal > 0 ? formatPrice(estimatedTotal) : '—'}</span>
              </div>
              {hasQuoteItems && (
                <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded-md">
                  Some items need a price quote — our team will provide final pricing via WhatsApp
                </p>
              )}
              <Separator />
              {estimatedTotal > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Estimated Total</span>
                  <span>{formatPrice(estimatedTotal)}</span>
                </div>
              )}
              <Button className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white gap-2" size="lg" onClick={() => setStep('checkout')}>
                <MessageCircle className="h-5 w-5" /> Proceed to WhatsApp Checkout
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Checkout form */
        <div className="max-w-xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Delivery & Contact Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Full Name *</Label>
                <Input value={form.name} onChange={(e) => updateForm('name', e.target.value)} placeholder="Your full name" />
              </div>
              <div>
                <Label>Phone Number *</Label>
                <Input value={form.phone} onChange={(e) => updateForm('phone', e.target.value)} placeholder="08012345678" />
              </div>
              <div>
                <Label>Email (optional)</Label>
                <Input type="email" value={form.email} onChange={(e) => updateForm('email', e.target.value)} placeholder="you@company.com" />
              </div>
              <div>
                <Label>Company Name (optional)</Label>
                <Input value={form.company} onChange={(e) => updateForm('company', e.target.value)} placeholder="Your company" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Delivery State *</Label>
                  <Select value={form.state} onValueChange={(v) => updateForm('state', v)}>
                    <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                    <SelectContent>
                      {NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>City *</Label>
                  <Input value={form.city} onChange={(e) => updateForm('city', e.target.value)} placeholder="City" />
                </div>
              </div>
              <div>
                <Label>Order Notes (optional)</Label>
                <Textarea value={form.notes} onChange={(e) => updateForm('notes', e.target.value)} placeholder="Any special requests..." rows={3} />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" onClick={() => setStep('cart')}>Back to Cart</Button>
                <Button
                  className="flex-1 bg-whatsapp hover:bg-whatsapp/90 text-white gap-2"
                  size="lg"
                  onClick={handleCheckout}
                  disabled={submitting || !form.name || !form.phone || !form.state || !form.city}
                >
                  <MessageCircle className="h-5 w-5" />
                  {submitting ? 'Sending...' : 'Send Order on WhatsApp'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}