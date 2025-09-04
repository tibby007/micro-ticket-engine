export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface Subscription {
  active: boolean;
  status: string;
  trialEndsAt?: string;
  tier: 'starter' | 'pro' | 'premium';
  limits: {
    leadsPerRun: number;
    activeJobs: number;
    features: string[];
  };
  usage: {
    activeJobs: number;
  };
  isAdmin: boolean;
  customerEmail: string;
}

export interface Lead {
  id: string;
  businessName: string;
  contactInfo: {
    email?: string;
    phone?: string;
    website?: string;
  };
  address: string;
  category: string;
  tags: string[];
  status: 'searching' | 'returned' | 'emailed';
  createdAt: string;
  jobId: string;
}

export interface LeadJob {
  id: string;
  status: 'searching' | 'completed' | 'failed';
  progress: number;
  total: number;
  processed: number;
  message: string;
  searchParams: {
    industry: string;
    city: string;
    state: string;
    fundingType: 'equipment' | 'mca';
    fundingAmount: {
      min: number;
      max: number;
    };
  };
  createdAt: string;
}

export interface SearchRequest {
  industry: string;
  city: string;
  state: string;
  fundingType: 'equipment' | 'mca';
  fundingAmount: {
    min: number;
    max: number;
  };
}