const LEADS_API_BASE = import.meta.env.VITE_LEADS_API || "https://n8n.srv998244.hstgr.cloud/webhook/lead-search";
const APP_API_BASE = import.meta.env.VITE_APP_API || "https://n8n.srv998244.hstgr.cloud/webhook/microtix";
import { auth } from '../config/firebase';

const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

// Helper: normalize a free-form equipment text into a list of concise items
const parseEquipment = (text: string, industry?: string): string[] => {
  if (!text || typeof text !== 'string') return [];
  // Strip leading formula markers like '=' and markdown
  const cleaned = text.replace(/^=+/, '').replace(/^\s*Based on[\s\S]*?:/i, '').trim();

  // Split on common separators: newlines, bullets, hyphens, commas, middots
  const rawParts = cleaned
    .split(/\r?\n|\u2022|\u2023|\-|\u2013|\u2014|•|,/) // hyphen variants and bullets
    .map(s => s.replace(/^\s*\d+\.?\s*/, '')) // drop leading numbering
    .map(s => s.replace(/\*\*/g, '')) // drop markdown bold markers
    .map(s => s.trim())
    .filter(Boolean);

  // Keep short, equipment-like tokens (1-4 words)
  let items = Array.from(new Set(rawParts))
    .map(s => s.replace(/\s{2,}/g, ' '))
    .filter(s => s.length >= 3 && s.split(/\s+/).length <= 4);

  // Basic negative filter to drop cross-industry heavy machinery unless relevant
  const NEG = [/cnc/i, /scaffold/i, /printing press/i, /forklift/i];
  const looksRestaurant = /restaurant|food/i.test(industry || '');
  if (looksRestaurant) {
    items = items.filter(i => !NEG.some(rx => rx.test(i)));
  }

  // Positive allowlist for restaurants to bias toward relevant items
  if (looksRestaurant) {
    const ALLOW = [
      /oven/i, /range/i, /grill/i, /fryer/i, /hood/i, /vent/i, /dishwasher/i, /dish machine/i,
      /refrigerator/i, /refrigeration/i, /freezer/i, /ice/i, /prep table/i, /worktable/i,
      /mixer/i, /proof/i, /pos/i, /grease trap/i
    ];
    const preferred = items.filter(i => ALLOW.some(rx => rx.test(i)));
    if (preferred.length >= 4) items = preferred; // bias if we have enough
  }

  // Cap to 6
  items = items.slice(0, 6);

  // Fallback if empty
  if (items.length === 0 && looksRestaurant) {
    items = [
      'Commercial oven',
      'Range',
      'Deep fryer',
      'Vent hood',
      'Refrigeration unit',
      'POS system'
    ];
  }
  return items;
};

export const api = {
  // Start lead generation
  async startLeadGeneration(data: any) {
    // New workflow: single endpoint, ignores auth, returns leads immediately
    const location = [data.city, data.state].filter(Boolean).join(', ');
    const payload = {
      industry: data.industry,
      location,
      radius: data.radius,
      leadCount: data.leadCount,
      // Pass through keywords if provided (backend may ignore)
      keywords: data.keywords || ''
    };
    const response = await fetch(`${LEADS_API_BASE}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to generate leads: ${response.status} ${response.statusText}`);
    }
    // Returns array. Normalize to Lead-like objects regardless of shape
    const raw = await response.json();

    const toArray = (val: any) => (Array.isArray(val) ? val : val ? [val] : []);

    const [city, state] = (payload.location || '').split(',').map((s: string) => s.trim());

    const norm = (item: any, idx: number) => {
      const now = new Date().toISOString();
      const primaryEmail = String(item?.primaryEmail || item?.email || '').toLowerCase();
      const email = primaryEmail && !/not\s*found|n\/a|null|^"?=not/i.test(primaryEmail)
        ? primaryEmail.replace(/^"?=+/, '').replace(/"$/, '')
        : null;
      const recText = String(item?.equipmentRecommendation || item?.message?.content || '');
      const recs = parseEquipment(recText, data.industry);
      const name = item?.name || item?.businessName || item?.company || `${data.industry || 'Business'} Prospect #${idx + 1}`;
      const phone = item?.phone || item?.phoneNumber || null;
      const website = item?.website || item?.url || item?.domain || null;
      const rating = item?.rating != null ? String(item.rating) : null;
      const addr = item?.address || item?.fullAddress || '';
      const cat = item?.category || data.industry || 'Unknown';
      const itemCity = item?.city || city || '';
      const itemState = item?.state || state || '';
      const baseId = item?.id || item?.leadId || item?.lead_id || item?.businessId || item?.placeId || item?.googleId || `${Date.now()}`;
      return {
        id: `${baseId}-${idx}`,
        name,
        phone,
        email,
        website,
        rating,
        city: itemCity,
        state: itemState,
        address: addr,
        category: cat,
        stage: 'New',
        createdAt: item?.createdAt || now,
        source: (item?.source as string) || 'outscraper',
        equipmentRecommendations: toArray(recs),
      };
    };

    // If backend returned an array, normalize each item
    if (Array.isArray(raw)) {
      return raw.map(norm);
    }

    // Nested structures: {leads:[...]}, {data:[...]}
    if (Array.isArray(raw?.leads)) return raw.leads.map(norm);
    if (Array.isArray(raw?.data)) return raw.data.map(norm);

    // Single object — normalize and wrap
    return [norm(raw, 0)];
  },

  // Get user subscription info
  async getMe() {
    const token = await getIdToken();
    const response = await fetch(`${APP_API_BASE}?path=me`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.status} ${response.statusText}`);
    }
    // Some backends may return 200 with an empty body; guard JSON parsing
    const text = await response.text();
    if (!text || !text.trim()) {
      throw new Error('Empty response from /me');
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON from /me');
    }
  },

  // Job status/results removed in direct-generation mode

  // Update lead stage not supported in new workflow; keep client-side only

  // Create Stripe checkout session
  async createCheckout(data: any) {
    const token = await getIdToken();
    const response = await fetch(`${APP_API_BASE}?path=checkout`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to create checkout: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get billing portal
  async getPortal() {
    const token = await getIdToken();
    const response = await fetch(`${APP_API_BASE}?path=portal`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to get billing portal: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get admin stats
  async getAdminStats() {
    const token = await getIdToken();
    const response = await fetch(`${APP_API_BASE}?path=admin`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch admin stats: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Retry failed job
  async retryJob(jobId: string) {
    const token = await getIdToken();
    const response = await fetch(`${APP_API_BASE}?path=retry&jobId=${jobId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to retry job: ${response.statusText}`);
    }
    
    return response.json();
  }
};
