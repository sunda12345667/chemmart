import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardCheck, Droplet, Wrench, Waves, Building2, FileSignature, Factory } from 'lucide-react';
import { COMPANY_NAME, COMPANY_DESCRIPTION } from '@/lib/constants';

const SERVICES = [
  { icon: ClipboardCheck, title: 'NAFDAC Consultancy' },
  { icon: Droplet, title: 'Borehole Drilling' },
  { icon: Wrench, title: 'Plumbing & Fitting' },
  { icon: Waves, title: 'Water Treatment' },
  { icon: Building2, title: 'Building Supervision' },
  { icon: FileSignature, title: 'General Contracting' },
  { icon: Factory, title: 'Industrial/Factory Equipment Supply' },
];

export default function About() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-heading text-2xl md:text-3xl font-bold">About {COMPANY_NAME}</h1>
        <p className="text-muted-foreground mt-3 max-w-3xl leading-relaxed">{COMPANY_DESCRIPTION}</p>
      </div>

      <h2 className="font-heading text-xl font-bold mb-4">Our Services</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {SERVICES.map(({ icon: Icon, title }) => (
          <Card key={title}>
            <CardContent className="p-5 flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium text-sm">{title}</span>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
