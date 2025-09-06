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
    leadsThisMonth: number;
  };
  isAdmin: boolean;
  customerEmail: string;
}

export interface Lead {
  id: string;
  name: string;              // Real business name like "Atlanta Breakfast Club"
  phone: string | null;      // Real phone numbers like "(404) 555-1234"
  email: string | null;      // Usually null from Outscraper
  website: string | null;    // Real websites
  rating: string | null;     // Google ratings like "4.2"
  city: string;
  state: string;
  address: string;
  category: string;
  stage: 'New' | 'Contacted' | 'Qualified' | 'Disqualified' | 'Won';
  createdAt: string;
  source: 'outscraper';
  googleId?: string;
  placeId?: string;
  reviewsCount?: number;
  workingHours?: string;
}

export interface LeadJob {
  id: string;
  status: 'searching' | 'processing' | 'completed' | 'failed';
  progress: number;
  total: number;
  processed: number;
  message: string;
  searchParams: SearchRequest;
  createdAt: string;
  completedAt?: string;
  error?: string;
}

export interface SearchRequest {
  industry: string;
  city: string;
  state: string;
  leadCount?: number;
  radius?: number;
  keywords?: string[];
}

export interface AdminStats {
  totalUsers: number;
  activeSubscriptions: number;
  totalRevenue: number;
  searchesThisMonth: number;
  leadsGenerated: number;
  recentActivity: Array<{
    id: string;
    type: 'search' | 'signup' | 'upgrade' | 'trial_started' | 'trial_ended' | 'lead_generated';
    user: string;
    timestamp: string;
    details: string;
  }>;
  systemHealth: {
    n8nStatus: 'healthy' | 'degraded' | 'down';
    stripeStatus: 'healthy' | 'degraded' | 'down';
    lastHealthCheck: string;
  };
  tierDistribution: {
    starter: number;
    pro: number;
    premium: number;
  };
}