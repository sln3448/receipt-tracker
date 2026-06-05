// hooks/useAuth.js
'use client';

import { useAuth as useAuthContext } from '@/context/AuthContext';

export function useAuth() {
  return useAuthContext();
}

export function useRequireAuth() {
  const auth = useAuthContext();
  
  if (!auth.loading && !auth.isAuthenticated) {
    return { requiresAuth: true, user: null };
  }
  
  return { requiresAuth: false, user: auth.user };
}
