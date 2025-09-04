import { auth } from '../config/firebase';

const POST_API_BASE = "https://aimarvels.app.n8n.cloud/webhook/microtix";
const GET_API_BASE = "https://aimarvels.app.n8n.cloud/webhook/microtix-get";

// Helper function to get Firebase ID token
const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

export const api = {
  // GET requests use the GET webhook
  async getMe() {
    const token = await getIdToken();
    const response = await fetch(`${GET_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch user data: ${response.statusText}`);
    }
    return await response.json();
  },
  
  async getJobStatus(jobId: string) {
    const token = await getIdToken();
    const response = await fetch(`${GET_API_BASE}/status?jobId=${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch job status: ${response.statusText}`);
    }
    return await response.json();
  },
  
  async getJobResults(jobId: string) {
    const token = await getIdToken();
    const response = await fetch(`${GET_API_BASE}/results?jobId=${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch job results: ${response.statusText}`);
    }
    return await response.json();
  },

  async getAdminStats() {
    const token = await getIdToken();
    const response = await fetch(`${GET_API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!response.ok) {
      throw new Error(`Failed to fetch admin stats: ${response.statusText}`);
    }
    return await response.json();
  },
  
  // POST requests use the POST webhook  
  async startSearch(data: any) {
    const token = await getIdToken();
    const response = await fetch(`${POST_API_BASE}/start`, { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data) 
    });
    if (!response.ok) {
      throw new Error(`Failed to start search: ${response.statusText}`);
    }
    return await response.json();
  },
  
  async updateLead(jobId: string, leadId: string, status: string) {
    const token = await getIdToken();
    const response = await fetch(`${POST_API_BASE}/update`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ jobId, leadId, status })
    });
    if (!response.ok) {
      throw new Error(`Failed to update lead: ${response.statusText}`);
    }
    return await response.json();
  },
  
  async createCheckout(priceId: string) {
    const token = await getIdToken();
    const response = await fetch(`${POST_API_BASE}/checkout`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ priceId })
    });
    if (!response.ok) {
      throw new Error(`Failed to create checkout: ${response.statusText}`);
    }
    return await response.json();
  },

  async getPortal() {
    const token = await getIdToken();
    const response = await fetch(`${POST_API_BASE}/portal`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error(`Failed to get billing portal: ${response.statusText}`);
    }
    return await response.json();
  },

  async retryJob(jobId: string) {
    const token = await getIdToken();
    const response = await fetch(`${POST_API_BASE}/retry`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ jobId })
    });
    if (!response.ok) {
      throw new Error(`Failed to retry job: ${response.statusText}`);
    }
    return await response.json();
  }
};