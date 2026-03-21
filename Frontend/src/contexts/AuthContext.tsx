import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

type Role = 'admin' | 'analyst' | 'viewer';

type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: Role;
};

type AuthContextType = {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string, role: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;
};

const AUTH_STORAGE_KEY = 'tv_user';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// deprecated heuristic removed — roles come from `profiles` table

export const AuthProvider: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const raw = localStorage.getItem(AUTH_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(AUTH_STORAGE_KEY);
  }, [user]);

  // initialize from existing supabase session if present
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data?.session;
        const supaUser = session?.user;
        const id = supaUser?.id;
        const email = supaUser?.email;
        if (mounted && id && email) {
          // load role (authorization) from `profiles` table
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', id)
            .single();
          let name: string | undefined = undefined;
          let role: Role | undefined = undefined;
          // prefer name from auth user metadata if present
          const metaName = supaUser?.user_metadata?.full_name ?? supaUser?.user_metadata?.name;
          if (metaName) name = metaName;
          if (!error && profile) {
            role = (profile as any).role ?? undefined;
          }
          setUser({ id, email, name, role });
        }
      } catch (err) {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Use Supabase Auth to sign in securely
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { ok: false, error: error.message };
      const supaUser = data?.user ?? data?.session?.user;
      const id = supaUser?.id;
      const userEmail = supaUser?.email ?? email;

      // fetch role from profiles
      let name: string | undefined = undefined;
      let role: Role | undefined = undefined;
      try {
        if (id) {
          const { data: profile, error: pErr } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', id)
            .single();
          // prefer name from auth user metadata if present
          const metaName = supaUser?.user_metadata?.full_name ?? supaUser?.user_metadata?.name;
          if (metaName) name = metaName;
          if (!pErr && profile) {
            role = (profile as any).role ?? undefined;
          }
        }
      } catch (e) {
        // ignore profile fetch errors
      }

      const authUser: AuthUser = { id: id ?? '', email: userEmail, name, role };
      setUser(authUser);
      return { ok: true };
    } catch (err: any) {
      console.error('Auth login error', err);
      return { ok: false, error: err?.message ?? 'Unknown error' };
    }
  };

  const register = async (email: string, password: string, name: string, role: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role.toLowerCase(),
          },
        },
      });

      if (error) return { ok: false, error: error.message };

      const supaUser = data?.user;
      if (supaUser) {
        // Create profile in profiles table
        const { error: profileError } = await supabase.from('profiles').insert([
          {
            id: supaUser.id,
            email: email,
            role: role.toLowerCase(),
          },
        ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          // We don't necessarily fail registration if profile insert fails, 
          // but it's good to know.
        }

        const authUser: AuthUser = {
          id: supaUser.id,
          email: supaUser.email || email,
          name: name,
          role: role.toLowerCase() as Role,
        };
        setUser(authUser);
      }

      return { ok: true };
    } catch (err: any) {
      console.error('Auth register error', err);
      return { ok: false, error: err?.message || 'Unknown error' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>{children}</AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

export default AuthContext;
