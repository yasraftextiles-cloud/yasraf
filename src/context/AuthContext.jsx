import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase.js';
import { 
  getCustomerProfile, 
  upsertCustomerProfile, 
  getCustomerAddresses, 
  createCustomerAddress, 
  updateCustomerAddress, 
  deleteCustomerAddress, 
  setDefaultCustomerAddress 
} from '../services/customerService.js';
import { checkIsAdmin } from '../services/supabaseService.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Track if guest cart was merged for current login session
  const lastMergedUserIdRef = useRef(null);

  // Monotonic sequence and active user reference to prevent stale in-flight requests from restoring previous user state
  const activeUserDataSeqRef = useRef(0);
  const currentAuthUserIdRef = useRef(null);

  // Load profile and addresses for an authenticated user outside auth callbacks
  const loadUserData = useCallback(async (authUser) => {
    if (!authUser || !authUser.id) {
      currentAuthUserIdRef.current = null;
      activeUserDataSeqRef.current++;
      setProfile(null);
      setAddresses([]);
      setIsAdmin(false);
      return;
    }

    currentAuthUserIdRef.current = authUser.id;
    const requestSeq = ++activeUserDataSeqRef.current;

    try {
      // 1. Check admin status strictly using trusted RPC (no user_metadata fallback)
      const adminStatus = await checkIsAdmin();
      if (requestSeq !== activeUserDataSeqRef.current || currentAuthUserIdRef.current !== authUser.id) return;
      setIsAdmin(Boolean(adminStatus));

      // 2. Fetch Customer Profile
      const { data: profData, error: profErr } = await getCustomerProfile(authUser.id);
      if (requestSeq !== activeUserDataSeqRef.current || currentAuthUserIdRef.current !== authUser.id) return;

      if (!profErr && profData) {
        setProfile(profData);
      } else {
        // Fallback to initial auth user information if table row not yet queried
        setProfile({
          id: authUser.id,
          email: authUser.email,
          full_name: authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split('@')[0] || 'Valued Client',
          phone: authUser.user_metadata?.phone || null,
          city: authUser.user_metadata?.city || null
        });
      }

      // 3. Fetch Saved Addresses
      const { data: addrList, error: addrErr } = await getCustomerAddresses(authUser.id);
      if (requestSeq !== activeUserDataSeqRef.current || currentAuthUserIdRef.current !== authUser.id) return;

      if (!addrErr && addrList) {
        setAddresses(addrList);
      } else {
        setAddresses([]);
      }
    } catch (err) {
      console.warn('[AuthContext] Error loading user data:', err);
    }
  }, []);

  // Schedule user data fetching outside of onAuthStateChange to prevent locking/races
  const scheduleUserDataLoad = useCallback((targetUser) => {
    if (!targetUser) {
      currentAuthUserIdRef.current = null;
      activeUserDataSeqRef.current++;
      setProfile(null);
      setAddresses([]);
      setIsAdmin(false);
      return;
    }
    setTimeout(() => {
      loadUserData(targetUser);
    }, 0);
  }, [loadUserData]);

  // Initialize session and listen for auth state transitions
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setIsLoading(false);
      return;
    }

    // Check for password recovery hash in URL
    const hash = window.location.hash || '';
    if (hash.includes('type=recovery')) {
      setIsPasswordRecovery(true);
    }

    // Initial session retrieval
    supabase.auth.getSession().then(({ data: { session: initialSession }, error }) => {
      if (error) {
        console.warn('[AuthContext] Initial session check warning:', error.message);
      }
      if (initialSession?.user) {
        setSession(initialSession);
        setUser(initialSession.user);
        scheduleUserDataLoad(initialSession.user);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
        setAddresses([]);
        setIsAdmin(false);
      }
      setIsLoading(false);
    }).catch(err => {
      console.warn('[AuthContext] Session retrieval exception:', err);
      setIsLoading(false);
    });

    // Subscribe to auth state updates without awaited calls inside callback
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      const currentUser = currentSession?.user || null;
      setUser(currentUser);

      if (event === 'PASSWORD_RECOVERY') {
        setIsPasswordRecovery(true);
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') {
        if (currentUser) {
          scheduleUserDataLoad(currentUser);
        }
      } else if (event === 'SIGNED_OUT') {
        // Prevent stale requests from restoring state
        currentAuthUserIdRef.current = null;
        activeUserDataSeqRef.current++;
        setUser(null);
        setSession(null);
        setProfile(null);
        setAddresses([]);
        setIsAdmin(false);
        lastMergedUserIdRef.current = null;
      }

      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [scheduleUserDataLoad]);

  // Sign Up with Email & Password (Full name, phone, city passed in options.data)
  const signUp = async ({ email, password, fullName, phone, city }) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }

    const trimmedEmail = email.trim();
    const trimmedName = fullName?.trim() || '';
    const trimmedPhone = phone?.trim() || '';
    const trimmedCity = city?.trim() || '';

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          full_name: trimmedName,
          phone: trimmedPhone,
          city: trimmedCity
        },
        emailRedirectTo: `${window.location.origin}/#auth-callback`
      }
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    // If session was immediately established (email confirmation disabled in Supabase)
    if (data.user && data.session) {
      scheduleUserDataLoad(data.user);
    }

    return {
      user: data.user,
      session: data.session,
      needsEmailConfirmation: !data.session
    };
  };

  // Sign In with Email & Password
  const signIn = async ({ email, password }) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    if (data.user) {
      setUser(data.user);
      setSession(data.session);
      scheduleUserDataLoad(data.user);
    }

    return data;
  };

  // Sign Out with comprehensive state isolation
  const signOut = async () => {
    setAuthError(null);
    currentAuthUserIdRef.current = null;
    activeUserDataSeqRef.current++;

    try {
      if (isSupabaseConfigured) {
        const { error } = await supabase.auth.signOut();
        if (error) {
          console.warn('[AuthContext] Sign out warning:', error.message);
        }
      }
    } catch (err) {
      console.warn('[AuthContext] Sign out warning:', err);
    } finally {
      setUser(null);
      setSession(null);
      setProfile(null);
      setAddresses([]);
      setIsAdmin(false);
      lastMergedUserIdRef.current = null;
      try {
        localStorage.removeItem('yasraf_last_order');
      } catch {}
    }
  };

  // Send Password Reset Email
  const requestPasswordReset = async (email) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }

    const redirectUrl = `${window.location.origin}/#reset-password`;

    const { data, error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: redirectUrl
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    return data;
  };

  // Update Password (used on Reset Password page)
  const updatePassword = async (newPassword) => {
    setAuthError(null);
    if (!isSupabaseConfigured) {
      throw new Error('Supabase client is not configured.');
    }

    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });

    if (error) {
      setAuthError(error.message);
      throw error;
    }

    setIsPasswordRecovery(false);
    return data;
  };

  // Update Profile details (full name, phone, city)
  const updateProfile = async ({ fullName, phone, city }) => {
    if (!user) throw new Error('Not authenticated');

    const res = await upsertCustomerProfile(user.id, { fullName, phone, city });
    if (!res.success) {
      throw new Error(res.error);
    }

    setProfile(prev => ({
      ...prev,
      full_name: fullName,
      phone: phone,
      city: city
    }));

    return res.data;
  };

  // Address Management
  const fetchAddresses = async () => {
    if (!user) return [];
    const { data, error } = await getCustomerAddresses(user.id);
    if (error) {
      console.warn('[AuthContext] fetchAddresses error:', error.message);
      return [];
    }
    setAddresses(data || []);
    return data || [];
  };

  const addAddress = async (addressData) => {
    if (!user) throw new Error('Not authenticated');
    const res = await createCustomerAddress(user.id, addressData);
    if (!res.success) throw new Error(res.error);
    await fetchAddresses();
    return res.data;
  };

  const editAddress = async (addressId, addressData) => {
    if (!user) throw new Error('Not authenticated');
    const res = await updateCustomerAddress(user.id, addressId, addressData);
    if (!res.success) throw new Error(res.error);
    await fetchAddresses();
    return res.data;
  };

  const removeAddress = async (addressId) => {
    if (!user) throw new Error('Not authenticated');
    const res = await deleteCustomerAddress(user.id, addressId);
    if (!res.success) throw new Error(res.error);
    await fetchAddresses();
    return true;
  };

  const makeAddressDefault = async (addressId) => {
    if (!user) throw new Error('Not authenticated');
    const res = await setDefaultCustomerAddress(user.id, addressId);
    if (!res.success) throw new Error(res.error);
    await fetchAddresses();
    return res.data;
  };

  const defaultAddress = addresses.find(a => a.is_default) || addresses[0] || null;

  const value = {
    user,
    session,
    profile,
    addresses,
    defaultAddress,
    isAdmin,
    isLoading,
    authError,
    setAuthError,
    isPasswordRecovery,
    setIsPasswordRecovery,
    lastMergedUserIdRef,
    signUp,
    signIn,
    signOut,
    requestPasswordReset,
    updatePassword,
    updateProfile,
    fetchAddresses,
    addAddress,
    editAddress,
    removeAddress,
    makeAddressDefault,
    refreshUserData: () => user && scheduleUserDataLoad(user)
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
