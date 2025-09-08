import { useState, useEffect } from 'react';
import type { User } from 'firebase/auth';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail
} from 'firebase/auth';
import { auth } from '../config/firebase';
// import { api } from '../services/api';
import type { Subscription } from '../types';
import type { User as FirebaseUser } from 'firebase/auth';

function adminFallbackSubscription(user: FirebaseUser): Subscription {
  return {
    active: true,
    status: 'active',
    tier: 'premium',
    limits: {
      leadsPerSearch: 1000,
      activeJobs: 1000,
      features: ['admin']
    },
    usage: {
      activeJobs: 0,
      searchesThisMonth: 0,
      leadsThisMonth: 0
    },
    isAdmin: true,
    customerEmail: user.email || ''
  };
}

function localBasicSubscription(user: FirebaseUser): Subscription {
  return {
    active: true,
    status: 'active',
    tier: 'pro',
    limits: {
      leadsPerSearch: 100,
      activeJobs: 5,
      features: []
    },
    usage: {
      activeJobs: 0,
      searchesThisMonth: 0,
      leadsThisMonth: 0
    },
    isAdmin: false,
    customerEmail: user.email || ''
  };
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    subscription: null,
    loading: true,
    error: null
  });

  const refreshSubscription = async () => {
    if (!authState.user) return;
    try {
      const tokenResult = await authState.user.getIdTokenResult(true);
      if (tokenResult.claims?.isAdmin === true) {
        setAuthState(prev => ({ ...prev, subscription: adminFallbackSubscription(authState.user!), error: null }));
      } else {
        setAuthState(prev => ({ ...prev, subscription: localBasicSubscription(authState.user!), error: null }));
      }
    } catch (error) {
      // Fallback to basic local subscription on any error
      setAuthState(prev => ({ ...prev, subscription: localBasicSubscription(authState.user!), error: null }));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const tokenResult = await user.getIdTokenResult(true);
          if (tokenResult.claims?.isAdmin === true) {
            setAuthState({ user, subscription: adminFallbackSubscription(user), loading: false, error: null });
          } else {
            setAuthState({ user, subscription: localBasicSubscription(user), loading: false, error: null });
          }
        } catch {
          setAuthState({ user, subscription: localBasicSubscription(user), loading: false, error: null });
        }
      } else {
        setAuthState({
          user: null,
          subscription: null,
          loading: false,
          error: null
        });
      }
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, error: null }));
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Password reset failed';
      setAuthState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  };

  return {
    user: authState.user,
    subscription: authState.subscription,
    loading: authState.loading,
    error: authState.error,
    login,
    register,
    logout,
    resetPassword,
    refreshSubscription
  };
}
