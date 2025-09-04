export interface User {
  uid: string;
  email: string;
  displayName?: string;
}

export interface Subscription {
  active: boolean;
  status: 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid';
  trialEndsAt?: string;
  tier: 'starter' | 'pro' | 'premium';
  limits: {
    leadsPerSearch: number;
    activeJobs: number;
    features: string[];
  };
  usage: {
    activeJobs: number;
    searchesThisMonth: number;
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
  enrichmentData?: {
    revenue?: string;
    employees?: string;
    industry?: string;
  };
}

export interface LeadJob {
  id: string;
  status: 'searching' | 'completed' | 'failed';
  progress: number;
  total: number;
  processed: number;
  message: string;
  searchParams: SearchRequest;
  createdAt: string;
  completedAt?: string;
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

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  searchesThisMonth: number;
  recentActivity: Array<{
    id: string;
    type: 'search' | 'signup' | 'upgrade' | 'trial_started' | 'trial_ended';
    user: string;
    timestamp: string;
    details: string;
  }>;
  systemHealth: {
    n8nStatus: 'healthy' | 'degraded' | 'down';
    stripeStatus: 'healthy' | 'degraded' | 'down';
    lastHealthCheck: string;
  };
}