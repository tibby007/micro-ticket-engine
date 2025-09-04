import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { api } from '../services/api';
import type { User, Subscription } from '../types';

const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || 'support@emergestack.dev').split(',');

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userData: User = {
          uid: firebaseUser.uid,
          email: firebaseUser.email!,
          displayName: firebaseUser.displayName || undefined,
        };
        setUser(userData);

        try {
          const subData = await api.getMe();
          // Check if user is admin based on email
          const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email!);
          setSubscription({ ...subData, isAdmin });
        } catch (error) {
          console.error('Failed to fetch subscription:', error);
          // Create default trial subscription for new users
          const isAdmin = ADMIN_EMAILS.includes(firebaseUser.email!);
          setSubscription({
            active: false,
            status: 'trialing',
            trialEndsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
            tier: 'starter',
            limits: {
              leadsPerSearch: 20,
              activeJobs: 1,
              features: ['Basic lead generation', 'Standard enrichment', 'Email support']
            },
            usage: {
              activeJobs: 0,
              searchesThisMonth: 0,
              leadsThisMonth: 0
            },
            isAdmin,
            customerEmail: firebaseUser.email!
          });
        }
      } else {
        setUser(null);
        setSubscription(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const register = async (email: string, password: string) => {
    await createUserWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
    // Clear any stored data
    localStorage.removeItem('microtix_active_jobs');
  };

  const refreshSubscription = async () => {
    if (user) {
      try {
        const subData = await api.getMe();
        const isAdmin = ADMIN_EMAILS.includes(user.email);
        setSubscription({ ...subData, isAdmin });
      } catch (error) {
        console.error('Failed to refresh subscription:', error);
      }
    }
  };

  return {
    user,
    subscription,
    loading,
    login,
    register,
    logout,
    refreshSubscription,
  };
}