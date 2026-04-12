'use client';

import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/nextjs';

export function GlobalInitialization() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();

  useEffect(() => {
    if (isLoaded && user) {
      const initializeUser = async () => {
        try {
          const token = await getToken();
          await fetch('/api/users/sync', {
            method: 'POST',
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          });
        } catch (err) {
          console.error('Global Initialization error:', err);
        }
      };
      initializeUser();
    }
  }, [isLoaded, user, getToken]);

  return null;
}
