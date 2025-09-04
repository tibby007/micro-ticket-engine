import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import { api } from '../services/api';
import type { User, Subscription } from '../types';

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
          setSubscription(subData);
        } catch (error) {
          console.error('Failed to fetch subscription:', error);
          setSubscription(null);
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
  };

  const refreshSubscription = async () => {
    if (user) {
      try {
        const subData = await api.getMe();
        setSubscription(subData);
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