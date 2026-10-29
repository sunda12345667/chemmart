import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);

  const loadProfile = useCallback(async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', currentUser.id)
      .single();
    setProfile(data ?? null);
  }, []);

  const applySession = useCallback(async (session) => {
    const currentUser = session?.user ?? null;
    setUser(currentUser);
    setIsAuthenticated(!!currentUser);
    await loadProfile(currentUser);
  }, [loadProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      await applySession(session);
      setIsLoadingAuth(false);
      setAuthChecked(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      await applySession(session);
      setAuthChecked(true);
    });

    return () => subscription.unsubscribe();
  }, [applySession]);

  const checkUserAuth = useCallback(async () => {
    setIsLoadingAuth(true);
    const { data: { session } } = await supabase.auth.getSession();
    await applySession(session);
    setIsLoadingAuth(false);
    setAuthChecked(true);
  }, [applySession]);

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setIsAuthenticated(false);
  };

  const isAdmin = !!profile && !profile.is_disabled && ['staff', 'admin', 'super_admin'].includes(profile.role);
  const isSuperAdmin = profile?.role === 'super_admin';

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAuthenticated,
      isAdmin,
      isSuperAdmin,
      isLoadingAuth,
      authChecked,
      logout,
      checkUserAuth,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
