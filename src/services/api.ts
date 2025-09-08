const LEADS_API_BASE = import.meta.env.VITE_LEADS_API || "https://n8n.srv998244.hstgr.cloud/webhook/lead-search";
const APP_API_BASE = import.meta.env.VITE_APP_API || "https://n8n.srv998244.hstgr.cloud/webhook/microtix";
import { auth } from '../config/firebase';

const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
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
    // Returns array. Some workflows return AI analysis objects; normalize to Lead-like objects
    const raw = await response.json();

    const toArray = (val: any) => (Array.isArray(val) ? val : val ? [val] : []);
    const parseEquipment = (text: string): string[] => {
      if (!text || typeof text !== 'string') return [];
      // Remove any leading markers like '=...'
      const cleaned = text.replace(/^=+/, '');
      const lines = cleaned.split(/\r?\n/);
      const items: string[] = [];
      for (const line of lines) {
        const m = line.match(/^\s*\d+\.[\s*]*([^:]+?)(:|\n|$)/i);
        if (m && m[1]) {
          const name = m[1].replace(/\*\*/g, '').trim();
          if (name) items.push(name);
        }
      }
      // Fallback: if nothing matched, return the whole paragraph as a single recommendation
      if (items.length === 0) {
        const firstPara = cleaned.split(/\n\n/)[0]?.trim();
        if (firstPara) items.push(firstPara.slice(0, 160));
      }
      return items;
    };

    const [city, state] = (payload.location || '').split(',').map((s: string) => s.trim());

    // Util: does object already look like a lead?
    const looksLikeLead = (o: any) => o && (('name' in o) || ('address' in o) || ('city' in o) || ('category' in o));

    // Mapper for AI-analysis objects (array items)
    const mapAiItem = (item: any, idx: number) => {
      const content = item?.message?.content || item?.equipmentRecommendation || '';
      const recs = parseEquipment(content);
      const primaryEmail = String(item?.primaryEmail || '').toLowerCase();
      const email = primaryEmail && !/not\s*found|n\/a|null|^"?=not/i.test(primaryEmail) ? primaryEmail.replace(/^"?=+/, '').replace(/"$/,'') : null;
      const now = new Date().toISOString();
      return {
        id: `${Date.now()}-${idx}`,
        name: `${data.industry || 'Business'} Prospect #${idx + 1}`,
        phone: null,
        email,
        website: null,
        rating: null,
        city: city || '',
        state: state || '',
        address: '',
        category: data.industry || 'Unknown',
        stage: 'New',
        createdAt: now,
        source: 'outscraper',
        equipmentRecommendations: toArray(recs),
      };
    };

    // If backend returned an array
    if (Array.isArray(raw)) {
      if (raw.some(looksLikeLead)) return raw;
      return raw.map(mapAiItem);
    }

    // Backend returned a single object; map to a single lead and wrap into array
    const obj: any = raw || {};
    const now = new Date().toISOString();
    // Handle simple shape: { businessName, address, equipmentRecommendation }
    if ('businessName' in obj || 'address' in obj || 'equipmentRecommendation' in obj) {
      const recs = parseEquipment(String(obj.equipmentRecommendation || ''));
      return [{
        id: `${Date.now()}-0`,
        name: obj.businessName || `${data.industry || 'Business'} Prospect`,
        phone: null,
        email: null,
        website: null,
        rating: null,
        city: city || '',
        state: state || '',
        address: obj.address || '',
        category: obj.category || data.industry || 'Unknown',
        stage: 'New',
        createdAt: now,
        source: 'outscraper',
        equipmentRecommendations: toArray(recs),
      }];
    }

    // Fallback: treat as AI-analysis single object
    return [mapAiItem(obj, 0)];
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
