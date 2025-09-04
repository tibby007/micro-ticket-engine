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
import { api } from '../services/api';
import type { Subscription } from '../types';

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
      const subscription = await api.getSubscription();
      setAuthState(prev => ({ ...prev, subscription, error: null }));
    } catch (error) {
      console.error('Failed to refresh subscription:', error);
      setAuthState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Failed to load subscription'
      }));
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const subscription = await api.getSubscription();
          setAuthState({
            user,
            subscription,
            loading: false,
            error: null
          });
        } catch (error) {
          console.error('Failed to load subscription:', error);
          setAuthState({
            user,
            subscription: null,
            loading: false,
            error: error instanceof Error ? error.message : 'Failed to load subscription'
          });
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