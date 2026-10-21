import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { COMPANY_NAME, COMPANY_PHONE, COMPANY_EMAIL, COMPANY_ADDRESS, WHATSAPP_NUMBER } from '@/lib/constants';

export default function Contact() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">Contact {COMPANY_NAME}</h1>
        <p className="text-muted-foreground mt-2">We'd love to hear about your project</p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <a href={`tel:${COMPANY_PHONE}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
            <Phone className="h-5 w-5 text-primary" /> {COMPANY_PHONE}
          </a>
          <a href={`mailto:${COMPANY_EMAIL}`} className="flex items-center gap-3 text-sm hover:text-primary transition-colors">
            <Mail className="h-5 w-5 text-primary" /> {COMPANY_EMAIL}
          </a>
          <div className="flex items-center gap-3 text-sm">
            <MapPin className="h-5 w-5 text-primary" /> {COMPANY_ADDRESS}
          </div>

          <a
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`Hello ${COMPANY_NAME}, I'd like to get in touch.`)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="block pt-2"
          >
            <Button size="lg" className="w-full bg-whatsapp hover:bg-whatsapp/90 text-white gap-2">
              <MessageCircle className="h-5 w-5" /> Chat on WhatsApp
            </Button>
          </a>
        </CardContent>
      </Card>
    </div>
  );
}
