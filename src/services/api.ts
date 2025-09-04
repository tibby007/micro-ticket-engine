import { auth } from '../config/firebase';

const POST_API_BASE = "https://aimarvels.app.n8n.cloud/webhook/microtix";
const GET_API_BASE = "https://aimarvels.app.n8n.cloud/webhook/microtix-get";

// Helper function to get Firebase ID token
const getIdToken = async () => {
  // Your existing Firebase auth logic to get ID token
  const user = auth.currentUser;
  return await user.getIdToken();
};

export const api = {
  // GET requests use the GET webhook
  async getMe() {
    const token = await getIdToken();
    return fetch(`${GET_API_BASE}/me`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  
  async getJobStatus(jobId) {
    const token = await getIdToken();
    return fetch(`${GET_API_BASE}/status?jobId=${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  
  async getJobResults(jobId) {
    const token = await getIdToken();
    return fetch(`${GET_API_BASE}/results?jobId=${jobId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
  },
  
  // POST requests use the POST webhook  
  async startLeadGeneration(data) {
    const token = await getIdToken();
    return fetch(`${POST_API_BASE}/start`, { 
      method: 'POST', 
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data) 
    });
  },
  
  async updateLeadStage(data) {
    const token = await getIdToken();
    return fetch(`${POST_API_BASE}/update`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data) 
    });
  },
  
  async createCheckout(data) {
    const token = await getIdToken();
    return fetch(`${POST_API_BASE}/checkout`, { 
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data) 
    });
  }
};