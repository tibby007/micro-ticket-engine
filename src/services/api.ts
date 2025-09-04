import { auth } from '../config/firebase';
import type { Subscription, LeadJob, Lead, SearchRequest } from '../types';

const API_BASE = {
  me: import.meta.env.VITE_N8N_ME_URL,
  checkout: import.meta.env.VITE_N8N_CHECKOUT_URL,
  portal: import.meta.env.VITE_N8N_PORTAL_URL,
  start: import.meta.env.VITE_N8N_START_URL,
  status: import.meta.env.VITE_N8N_STATUS_URL,
  results: import.meta.env.VITE_N8N_RESULTS_URL,
  update: import.meta.env.VITE_N8N_UPDATE_URL,
};

async function getAuthToken(): Promise<string> {
  const user = auth.currentUser;
  if (!user) throw new Error('Not authenticated');
  return await user.getIdToken();
}

async function apiCall<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = await getAuthToken();
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API call failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export const api = {
  // Get user subscription and admin status
  getMe: (): Promise<Subscription> => apiCall(API_BASE.me),

  // Create Stripe checkout session
  createCheckout: (priceId: string): Promise<{ url: string }> =>
    apiCall(API_BASE.checkout, {
      method: 'POST',
      body: JSON.stringify({ priceId }),
    }),

  // Get Stripe portal URL
  getPortal: (): Promise<{ url: string }> => apiCall(API_BASE.portal),

  // Start lead search job
  startSearch: (request: SearchRequest): Promise<{ jobId: string }> =>
    apiCall(API_BASE.start, {
      method: 'POST',
      body: JSON.stringify(request),
    }),

  // Get job status
  getJobStatus: (jobId: string): Promise<LeadJob> =>
    apiCall(`${API_BASE.status}?jobId=${jobId}`),

  // Get job results
  getJobResults: (jobId: string): Promise<{ leads: Lead[] }> =>
    apiCall(`${API_BASE.results}?jobId=${jobId}`),

  // Update lead status
  updateLead: (leadId: string, status: Lead['status']): Promise<{ ok: boolean }> =>
    apiCall(API_BASE.update, {
      method: 'POST',
      body: JSON.stringify({ leadId, status }),
    }),
};