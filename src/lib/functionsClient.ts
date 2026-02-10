import { supabase } from '@/integrations/supabase/client';

const BASE = (import.meta.env.VITE_SUPABASE_URL ?? '').replace(/\/$/, '');

async function callFunction(name: string, body: any) {
  // try to get access token from session; fall back to getUser
  const sessionRes = await supabase.auth.getSession();
  let token = (sessionRes as any)?.data?.session?.access_token ?? (sessionRes as any)?.data?.access_token;
  if (!token) {
    try {
      const userRes = await supabase.auth.getUser();
      // userRes.data.user doesn't include access token; so attempt to read from storage
      // as a last resort, try to read from localStorage key used by supabase client
      const raw = localStorage.getItem('sb-' + (import.meta.env.VITE_SUPABASE_URL ?? '') + '-auth-token');
      if (raw) {
        try {
          const parsed = JSON.parse(raw);
          token = parsed?.access_token ?? parsed?.token ?? token;
        } catch {}
      }
    } catch {}
  }

  if (!token) throw new Error('Not authenticated (no access token)');

  const res = await fetch(`${BASE}/functions/v1/${name}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? '',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  if (!res.ok) {
    let errMessage = text || res.statusText;
    try { errMessage = JSON.parse(text)?.message ?? text; } catch {};
    const full = `Function ${name} failed (${res.status}): ${errMessage}`;
    console.error(full);
    throw new Error(full);
  }

  try { return JSON.parse(text); } catch { return text; }
}

export const createUserFn = (email: string, password: string, role: string) =>
  callFunction('create-user', { email, password, role });

export const updateUserFn = (userId: string, email?: string, password?: string, role?: string) =>
  callFunction('update-user', { userId, email, password, role });

export const deleteUserFn = (userId: string) =>
  callFunction('delete-user', { userId });

export default { createUserFn, updateUserFn, deleteUserFn };
