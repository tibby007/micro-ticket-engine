import { auth } from '../config/firebase';
import type { Subscription, LeadJob, Lead, SearchRequest, AdminStats } from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://aimarvels.app.n8n.cloud/webhook/microtix';

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return await user.getIdToken();
}

async function apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  const url = `${API_BASE}${endpoint}`;
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = `API call failed: ${response.status} ${response.statusText}`;
    
    try {
      const errorData = JSON.parse(errorText);
      errorMessage = errorData.message || errorData.error || errorMessage;
    } catch {
      // Use default error message if response is not JSON
    }
    
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // Get user subscription and admin status
  getMe: (): Promise<Subscription> => apiCall('/me'),

  // Create Stripe checkout session
  createCheckout: (priceId: string): Promise<{ url: string }> => {
    const successUrl = `${window.location.origin}/dashboard?checkout=success`;
    const cancelUrl = `${window.location.origin}/dashboard?checkout=cancel`;
    
    return apiCall('/checkout', {
      method: 'POST',
      body: JSON.stringify({ priceId, successUrl, cancelUrl }),
    });
  },

  // Get Stripe portal URL
  getPortal: (): Promise<{ url: string }> => apiCall('/portal', { method: 'POST' }),

  // Start lead search job
  startSearch: (request: SearchRequest): Promise<{ jobId: string }> => {
    const payload = {
      industry: request.industry,
      city: request.city,
      state: request.state,
      leadCount: request.leadCount || 50,
      radius: request.radius || 25,
      keywords: request.keywords || []
    };
    
    return apiCall('/start', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Get job status
  getJobStatus: (jobId: string): Promise<LeadJob> =>
    apiCall(`/status?jobId=${jobId}`),

  // Get job results
  getJobResults: (jobId: string): Promise<{ leads: Lead[] }> =>
    apiCall(`/results?jobId=${jobId}`),

  // Update lead status
  updateLead: (jobId: string, leadId: string, stage: Lead['status']): Promise<{ ok: boolean }> =>
    apiCall('/update', {
      method: 'POST',
      body: JSON.stringify({ jobId, leadId, stage }),
    }),

  // Admin endpoints
  getAdminStats: (): Promise<AdminStats> => apiCall('/admin'),

  retryJob: (jobId: string): Promise<{ ok: boolean }> =>
    apiCall('/admin/retry', {
      method: 'POST',
      body: JSON.stringify({ jobId }),
    }),
};