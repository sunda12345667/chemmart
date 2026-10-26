export const COMPANY_NAME = "AMTECH GLOBAL SOLUTION SERVICES";
export const COMPANY_TAGLINE = "Engineering, Equipment & Industrial Solutions";
export const COMPANY_DESCRIPTION =
  "AMTECH GLOBAL SOLUTION SERVICES provides engineering, equipment and contracting solutions covering water treatment, borehole drilling, plumbing and fitting, equipment supply, building supervision, NAFDAC consultancy and general contracting.";

export const COMPANY_PHONE = "+234 803 517 7394";
export const COMPANY_PHONE_TEL = "tel:+2348035177394";
export const COMPANY_EMAIL = "amtechglobalsolution2010@gmail.com";
export const COMPANY_ADDRESS = "Lagos, Nigeria";

export const WHATSAPP_NUMBER = "2348035177394";
export const WHATSAPP_BASE_URL = `https://wa.me/${WHATSAPP_NUMBER}`;

export const CATEGORIES = [
  { name: 'Water Treatment', slug: 'water-treatment', icon: 'Droplets', desc: 'Water treatment plants & deionizers', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  { name: 'Water Dispensers', slug: 'water-dispensers', icon: 'GlassWater', desc: 'Commercial & domestic dispensers', color: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  { name: 'Washing Machines', slug: 'washing-machines', icon: 'WashingMachine', desc: 'Commercial & domestic washing machines', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  { name: 'Plumbing & Fittings', slug: 'plumbing-fittings', icon: 'Wrench', desc: 'Pipes, fittings & plumbing materials', color: 'bg-orange-50 text-orange-700 border-orange-200' },
  { name: 'Borehole Equipment', slug: 'borehole-equipment', icon: 'Drill', desc: 'Drilling rigs & borehole accessories', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  { name: 'Factory & Industrial Equipment', slug: 'factory-equipment', icon: 'Cog', desc: 'Processing & production equipment', color: 'bg-slate-50 text-slate-700 border-slate-200' },
  { name: 'Building & Contracting', slug: 'building-contracting', icon: 'Building2', desc: 'Supervision & general contracting', color: 'bg-pink-50 text-pink-700 border-pink-200' },
  { name: 'Other Equipment', slug: 'other-equipment', icon: 'Package', desc: 'Other specialized equipment', color: 'bg-green-50 text-green-700 border-green-200' },
];

export const NIGERIAN_STATES = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno",
  "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT Abuja", "Gombe",
  "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau",
  "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara"
];

export const STOCK_STATUS_LABELS = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of Stock",
  pre_order: "Pre-Order"
};

export const STOCK_STATUS_COLORS = {
  in_stock: "bg-green-100 text-green-800",
  low_stock: "bg-amber-100 text-amber-800",
  out_of_stock: "bg-red-100 text-red-800",
  pre_order: "bg-blue-100 text-blue-800"
};

export const LEAD_STATUS_LABELS = {
  new: "New",
  contacted: "Contacted",
  quoted: "Quoted",
  negotiating: "Negotiating",
  won: "Won",
  lost: "Lost"
};

export const LEAD_STATUS_COLORS = {
  new: "bg-blue-100 text-blue-800",
  contacted: "bg-yellow-100 text-yellow-800",
  quoted: "bg-purple-100 text-purple-800",
  negotiating: "bg-orange-100 text-orange-800",
  won: "bg-green-100 text-green-800",
  lost: "bg-red-100 text-red-800"
};

export const PRICE_FORMATTER = new Intl.NumberFormat('en-NG', {
  style: 'currency',
  currency: 'NGN',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
});

export function formatPrice(amount) {
  return PRICE_FORMATTER.format(amount);
}

export function generateReferenceId() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = 'ORD-';
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function buildWhatsAppUrl(message) {
  return `${WHATSAPP_BASE_URL}?text=${encodeURIComponent(message)}`;
}
