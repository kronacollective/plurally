// import { fetchEnvironmentVariable } from '@/lib/env';
import { createBrowserClient } from '@supabase/ssr'
import { useMemo } from 'react';

export function createClient() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!; /* ?? fetchEnvironmentVariable('SUPABASE_URL')[0]; */
  const SUPABASE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!; /* ?? fetchEnvironmentVariable('SUPABASE_ANON_KEY')[0]; */
  return createBrowserClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
}

export const useSupabase = () => useMemo(() => createClient(), []);
