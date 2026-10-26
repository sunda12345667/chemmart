import React, { useState } from 'react';
import { submitPublicForm } from '@/lib/publicSubmission';
import { NIGERIAN_STATES, WHATSAPP_NUMBER } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Mail, MessageCircle, Phone } from 'lucide-react';
import { COMPANY_EMAIL, COMPANY_PHONE, COMPANY_PHONE_TEL } from '@/lib/constants';

export default function RequestQuote() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState('');

  const submitForm = async (type, formData) => {
    setSubmitting(true);
    setSubmissionError('');
    const refId = `INQ-${Date.now().toString(36).toUpperCase()}`;

    try {
      await submitPublicForm({
      type,
      reference_id: refId,
      customer_name: formData.name,
      customer_phone: formData.phone,
      customer_email: formData.email,
      company_name: formData.company,
      delivery_state: formData.state,
      delivery_city: formData.city,
      notes: formData.details,
      status: 'new',
      activity_log: [{ action: `${type} form submitted`, date: new Date().toISOString() }]
      });
      setSubmitted(true);
    } catch (error) {
      setSubmissionError(error.message || 'Unable to submit your request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <CheckCircle className="h-16 w-16 text-primary mx-auto mb-4" />
        <h1 className="font-heading text-2xl font-bold mb-2">Request Submitted!</h1>
        <p className="text-muted-foreground mb-6">Our team will contact you within 24 hours. You can also reach us directly on WhatsApp.</p>
        <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Hello AMTECH GLOBAL SOLUTION SERVICES, I just submitted a request on your website.')}`} target="_blank" rel="noopener noreferrer">
          <Button className="bg-whatsapp hover:bg-whatsapp/90 text-white gap-2">
            <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
          </Button>
        </a>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Get a Quote or Expert Help</h1>
        <p className="text-muted-foreground mt-2">Fill out the form and our team will get back to you within 24 hours</p>
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
          <a href={COMPANY_PHONE_TEL} className="inline-flex items-center gap-2 text-primary hover:underline">
            <Phone className="h-4 w-4" /> {COMPANY_PHONE}
          </a>
          <a href={`mailto:${COMPANY_EMAIL}`} className="inline-flex items-center gap-2 text-primary hover:underline">
            <Mail className="h-4 w-4" /> {COMPANY_EMAIL}
          </a>
        </div>
      </div>

      {submissionError && <p role="alert" className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{submissionError}</p>}

      <Tabs defaultValue="bulk_quote">
        <TabsList className="grid grid-cols-2 w-full gap-1 h-auto p-1">
          <TabsTrigger value="bulk_quote">Equipment Quote</TabsTrigger>
          <TabsTrigger value="technical_inquiry">NAFDAC & Technical</TabsTrigger>
          <TabsTrigger value="machine_sourcing">Equipment Sourcing</TabsTrigger>
          <TabsTrigger value="product_inquiry">Contracting & Supervision</TabsTrigger>
        </TabsList>

        {[
          { key: 'bulk_quote', title: 'Request an Equipment/Materials Quote', desc: 'Get competitive pricing for equipment, materials or bulk supply', detailLabel: 'Items & Quantities Needed' },
          { key: 'technical_inquiry', title: 'NAFDAC & Technical Consultancy', desc: 'Get expert guidance on NAFDAC compliance, water treatment or installation questions', detailLabel: 'Describe Your Technical Question' },
          { key: 'machine_sourcing', title: 'Equipment Sourcing Request', desc: 'Tell us what equipment you need and we\'ll source it', detailLabel: 'Equipment Type & Specifications Needed' },
          { key: 'product_inquiry', title: 'Building Supervision & General Contracting', desc: 'Tell us about your project and we\'ll get back to you', detailLabel: 'Describe Your Project or Requirement' },
        ].map(tab => (
          <TabsContent key={tab.key} value={tab.key}>
            <QuoteForm
              title={tab.title}
              description={tab.desc}
              detailLabel={tab.detailLabel}
              onSubmit={(data) => submitForm(tab.key, data)}
              submitting={submitting}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

function QuoteForm({ title, description, detailLabel, onSubmit, submitting }) {
  const [form, setForm] = useState({ name: '', phone: '', email: '', company: '', state: '', city: '', details: '' });
  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid sm:grid-cols-2 gap-4">
          <div><Label>Full Name *</Label><Input value={form.name} onChange={e => update('name', e.target.value)} /></div>
          <div><Label>Phone *</Label><Input value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="08012345678" /></div>
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={e => update('email', e.target.value)} /></div>
          <div><Label>Company</Label><Input value={form.company} onChange={e => update('company', e.target.value)} /></div>
          <div>
            <Label>State</Label>
            <Select value={form.state} onValueChange={v => update('state', v)}>
              <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
              <SelectContent>{NIGERIAN_STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div><Label>City</Label><Input value={form.city} onChange={e => update('city', e.target.value)} /></div>
        </div>
        <div>
          <Label>{detailLabel} *</Label>
          <Textarea value={form.details} onChange={e => update('details', e.target.value)} rows={5} placeholder="Please provide as much detail as possible..." />
        </div>
        <Button
          className="w-full gap-2"
          size="lg"
          onClick={() => onSubmit(form)}
          disabled={submitting || !form.name || !form.phone || !form.details}
        >
          {submitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </CardContent>
    </Card>
  );
}