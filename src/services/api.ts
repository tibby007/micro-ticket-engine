const API_BASE = "https://aimarvels.app.n8n.cloud/webhook/microtix";
import { auth } from '../config/firebase';

const getIdToken = async () => {
  const user = auth.currentUser;
  if (!user) throw new Error('User not authenticated');
  return await user.getIdToken();
};

export const api = {
  // Start lead generation
  async startLeadGeneration(data: any) {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}?path=start`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to start lead generation: ${response.status} ${response.statusText}`);
    }
    // Guard against empty body or non-JSON responses
    const text = await response.text();
    if (!text || !text.trim()) {
      throw new Error('Empty response from /start');
    }
    try {
      return JSON.parse(text);
    } catch (e) {
      throw new Error('Invalid JSON from /start');
    }
  },

  // Get user subscription info
  async getMe() {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}?path=me`, {
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

  // Check job status
  async getJobStatus(jobId: string) {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}?path=status&jobId=${jobId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job status: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Get job results
  async getJobResults(jobId: string) {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}?path=results&jobId=${jobId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job results: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Update lead stage
  async updateLeadStage(data: any) {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}?path=update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Failed to update lead stage: ${response.statusText}`);
    }
    
    return response.json();
  },

  // Create Stripe checkout session
  async createCheckout(data: any) {
    const token = await getIdToken();
    const response = await fetch(`${API_BASE}?path=checkout`, {
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
    const response = await fetch(`${API_BASE}?path=portal`, {
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
    const response = await fetch(`${API_BASE}?path=admin`, {
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
    const response = await fetch(`${API_BASE}?path=retry&jobId=${jobId}`, {
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
