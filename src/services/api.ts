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
    // Returns array of leads immediately
    return response.json();
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
