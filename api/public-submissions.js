import { createHash, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const MAX_FIELD_LENGTHS = {
  customer_name: 200,
  customer_phone: 40,
  customer_email: 320,
  company_name: 200,
  delivery_state: 100,
  delivery_city: 200,
  notes: 10000,
};
const REQUIRED_SUPABASE_URL = 'https://cxgxwfsssrbuvwfrrsne.supabase.co';
const LEAD_TYPES = new Set([
  'whatsapp_checkout',
  'bulk_quote',
  'technical_inquiry',
  'machine_sourcing',
  'product_inquiry',
]);

function cleanText(value, maxLength) {
  if (value == null) return null;
  if (typeof value !== 'string') throw new Error('Invalid submission');
  const clean = value.trim();
  if (clean.length > maxLength) throw new Error('Submission exceeds allowed limits');
  return clean || null;
}

function getClientIp(req) {
  // Vercel's x-forwarded-for header is inserted at the edge; use only the
  // rightmost address and reject malformed values rather than trusting the
  // leftmost client-supplied value.
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' ? forwarded.split(',').at(-1)?.trim() : null;
  return typeof ip === 'string' && ip.length <= 64 && /^[0-9a-fA-F:.]+$/.test(ip) ? ip : null;
}

function createAdminClient() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (url !== REQUIRED_SUPABASE_URL || !serviceKey) {
    throw new Error('Submission service is not configured for the required Supabase project');
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const body = req.body;
    if (!body || typeof body !== 'object' || Array.isArray(body)) {
      return res.status(400).json({ error: 'Invalid submission' });
    }

    const clientIp = getClientIp(req);
    if (!clientIp) return res.status(400).json({ error: 'Unable to validate request' });

    const supabase = createAdminClient();
    const formType = body.form_type === 'service_request' ? 'service_request' : 'lead';
    const ipHash = createHash('sha256')
      .update(`${process.env.SUPABASE_SERVICE_ROLE_KEY}:${clientIp}`)
      .digest('hex');
    const { data: allowed, error: limitError } = await supabase.rpc(
      'check_public_submission_rate_limit',
      { p_ip_hash: ipHash, p_form_type: formType },
    );
    if (limitError) {
      console.error('Public submission rate limit unavailable');
      return res.status(503).json({ error: 'Unable to submit right now. Please try again later.' });
    }
    if (!allowed) return res.status(429).json({ error: 'Too many requests. Please try again later.' });

    if (formType === 'service_request') {
      const customerName = cleanText(body.customer_name, 200);
      const phone = cleanText(body.customer_phone, 40);
      const details = cleanText(body.details, 10000);
      if (!customerName || !phone || !details) {
        return res.status(400).json({ error: 'Name, phone, and request details are required.' });
      }
      const { error } = await supabase.from('service_requests').insert({
        request_number: `SR-${randomUUID()}`,
        customer_id: null,
        customer_name: customerName,
        customer_phone: phone,
        customer_email: cleanText(body.customer_email, 320),
        service_id: typeof body.service_id === 'string' ? body.service_id : null,
        service_name: cleanText(body.service_name, 200),
        location: cleanText(body.location, 300),
        details,
        attachment_urls: [],
        status: 'new',
        assigned_to: null,
        internal_notes: null,
      });
      if (error) {
        console.error('Service request insert failed');
        return res.status(400).json({ error: 'Unable to submit your request. Please try again.' });
      }
      return res.status(201).json({ success: true });
    }

    if (!LEAD_TYPES.has(body.type)) return res.status(400).json({ error: 'Invalid request type' });
    const customerName = cleanText(body.customer_name, MAX_FIELD_LENGTHS.customer_name);
    const customerPhone = cleanText(body.customer_phone, MAX_FIELD_LENGTHS.customer_phone);
    if (!customerName || !customerPhone) {
      return res.status(400).json({ error: 'Name and phone are required.' });
    }

    const submittedItems = Array.isArray(body.items) ? body.items.slice(0, 50) : [];
    if (Buffer.byteLength(JSON.stringify(submittedItems), 'utf8') > 65536) {
      return res.status(400).json({ error: 'Submission exceeds allowed limits' });
    }
    let items = [];
    let estimatedTotal = null;
    if (body.type === 'whatsapp_checkout') {
      if (!submittedItems.length || submittedItems.some(item =>
        !item || typeof item.product_id !== 'string' ||
        !Number.isSafeInteger(item.quantity) || item.quantity < 1 || item.quantity > 10000
      )) {
        return res.status(400).json({ error: 'Invalid enquiry items' });
      }
      const productIds = [...new Set(submittedItems.map(item => item.product_id))];
      const { data: products, error: productsError } = await supabase
        .from('products')
        .select('id,name,price_mode,price,product_type,is_active,deleted_at,packaging_sizes')
        .in('id', productIds);
      if (productsError || products.length !== productIds.length) {
        console.error('Catalog validation failed for WhatsApp enquiry');
        return res.status(400).json({ error: 'One or more products are no longer available.' });
      }
      const catalog = new Map(products.map(product => [product.id, product]));
      let verifiedTotal = 0;
      for (const submitted of submittedItems) {
        const product = catalog.get(submitted.product_id);
        const packaging = typeof submitted.packaging_size === 'string'
          ? submitted.packaging_size.slice(0, 100)
          : '';
        if (!product?.is_active || product.deleted_at ||
          (packaging && !(product.packaging_sizes || []).includes(packaging))) {
          return res.status(400).json({ error: 'One or more products are no longer available.' });
        }
        const price = product.price_mode === 'fixed' && product.product_type !== 'quote_only'
          ? Number(product.price)
          : null;
        if (price !== null && Number.isFinite(price) && price >= 0) {
          verifiedTotal += price * submitted.quantity;
        }
        items.push({
          product_id: product.id,
          product_name: product.name,
          quantity: submitted.quantity,
          packaging_size: packaging,
          price,
          is_quote: price === null,
        });
      }
      estimatedTotal = verifiedTotal;
    }
    const { error } = await supabase.from('leads').insert({
      type: body.type,
      reference_id: cleanText(body.reference_id, 100) || `INQ-${randomUUID()}`,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: cleanText(body.customer_email, MAX_FIELD_LENGTHS.customer_email),
      company_name: cleanText(body.company_name, MAX_FIELD_LENGTHS.company_name),
      delivery_state: cleanText(body.delivery_state, MAX_FIELD_LENGTHS.delivery_state),
      delivery_city: cleanText(body.delivery_city, MAX_FIELD_LENGTHS.delivery_city),
      notes: cleanText(body.notes, MAX_FIELD_LENGTHS.notes),
      items,
      estimated_total: estimatedTotal,
      status: 'new',
      whatsapp_message: null,
      activity_log: [],
      internal_notes: null,
    });
    if (error) {
      console.error('Lead insert failed');
      return res.status(400).json({ error: 'Unable to submit your request. Please try again.' });
    }
    return res.status(201).json({ success: true });
  } catch (error) {
    if (error.message === 'Invalid submission' || error.message === 'Submission exceeds allowed limits') {
      return res.status(400).json({ error: error.message });
    }
    console.error('Public submission service unavailable');
    return res.status(503).json({ error: 'Unable to submit right now. Please try again later.' });
  }
}
