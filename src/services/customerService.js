import { supabase, isSupabaseConfigured } from '../lib/supabase.js';

/**
 * Fetch customer profile
 */
export async function getCustomerProfile(userId) {
  if (!isSupabaseConfigured || !userId) {
    return { data: null, error: null };
  }

  try {
    const { data, error } = await supabase
      .from('customer_profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.warn('[CustomerService] getCustomerProfile note:', error.message);
      return { data: null, error };
    }

    return { data, error: null };
  } catch (err) {
    console.warn('[CustomerService] getCustomerProfile exception:', err.message);
    return { data: null, error: err };
  }
}

/**
 * Upsert customer profile
 */
export async function upsertCustomerProfile(userId, profileData) {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, error: 'Supabase is not configured' };
  }

  try {
    const row = {
      id: userId,
      full_name: profileData.fullName?.trim() || profileData.full_name?.trim() || '',
      phone: profileData.phone?.trim() || null,
      city: profileData.city?.trim() || null,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customer_profiles')
      .upsert(row)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { success: true, data };
  } catch (err) {
    console.error('[CustomerService] upsertCustomerProfile error:', err);
    return { success: false, error: err.message || 'Failed to update profile' };
  }
}

/**
 * Fetch customer saved delivery addresses
 */
export async function getCustomerAddresses(userId) {
  if (!isSupabaseConfigured || !userId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[CustomerService] getCustomerAddresses note:', error.message);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.warn('[CustomerService] getCustomerAddresses exception:', err.message);
    return { data: [], error: err };
  }
}

/**
 * Add a new delivery address
 * The database trigger (trg_customer_addresses_default) handles clearing the previous default address.
 */
export async function createCustomerAddress(userId, addressData) {
  if (!isSupabaseConfigured || !userId) {
    return { success: false, error: 'Supabase is not configured or user not authenticated' };
  }

  try {
    const isDefault = Boolean(addressData.is_default || addressData.isDefault);

    const row = {
      user_id: userId,
      label: addressData.label?.trim() || 'Home',
      full_name: addressData.fullName?.trim() || addressData.full_name?.trim() || '',
      phone: addressData.phone?.trim() || '',
      address_line1: addressData.addressLine1?.trim() || addressData.address_line1?.trim() || '',
      address_line2: addressData.addressLine2?.trim() || addressData.address_line2?.trim() || null,
      city: addressData.city?.trim() || '',
      province: addressData.province?.trim() || '',
      postal_code: addressData.postalCode?.trim() || addressData.postal_code?.trim() || null,
      is_default: isDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(row)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[CustomerService] createCustomerAddress error:', err);
    return { success: false, error: err.message || 'Failed to save address' };
  }
}

/**
 * Update an existing delivery address
 * The database trigger automatically clears other default flags when is_default=true.
 */
export async function updateCustomerAddress(userId, addressId, addressData) {
  if (!isSupabaseConfigured || !addressId) {
    return { success: false, error: 'Address ID required' };
  }

  try {
    const isDefault = Boolean(addressData.is_default || addressData.isDefault);

    const updates = {
      label: addressData.label?.trim() || 'Home',
      full_name: addressData.fullName?.trim() || addressData.full_name?.trim() || '',
      phone: addressData.phone?.trim() || '',
      address_line1: addressData.addressLine1?.trim() || addressData.address_line1?.trim() || '',
      address_line2: addressData.addressLine2?.trim() || addressData.address_line2?.trim() || null,
      city: addressData.city?.trim() || '',
      province: addressData.province?.trim() || '',
      postal_code: addressData.postalCode?.trim() || addressData.postal_code?.trim() || null,
      is_default: isDefault,
      updated_at: new Date().toISOString()
    };

    let query = supabase
      .from('customer_addresses')
      .update(updates)
      .eq('id', addressId);

    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[CustomerService] updateCustomerAddress error:', err);
    return { success: false, error: err.message || 'Failed to update address' };
  }
}

/**
 * Delete a saved delivery address with user_id ownership check
 */
export async function deleteCustomerAddress(userId, addressId) {
  // Support both deleteCustomerAddress(userId, addressId) and deleteCustomerAddress(addressId)
  const actualAddressId = addressId || userId;
  const actualUserId = addressId ? userId : null;

  if (!isSupabaseConfigured || !actualAddressId) {
    return { success: false, error: 'Address ID required' };
  }

  try {
    let query = supabase
      .from('customer_addresses')
      .delete()
      .eq('id', actualAddressId);

    if (actualUserId) {
      query = query.eq('user_id', actualUserId);
    }

    const { error } = await query;

    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('[CustomerService] deleteCustomerAddress error:', err);
    return { success: false, error: err.message || 'Failed to delete address' };
  }
}

/**
 * Set an address as the default in a single atomic request
 * (The database trigger automatically unsets previous default)
 */
export async function setDefaultCustomerAddress(userId, addressId) {
  if (!isSupabaseConfigured || !userId || !addressId) {
    return { success: false, error: 'User ID and Address ID required' };
  }

  try {
    const { data, error } = await supabase
      .from('customer_addresses')
      .update({ is_default: true, updated_at: new Date().toISOString() })
      .eq('id', addressId)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return { success: true, data };
  } catch (err) {
    console.error('[CustomerService] setDefaultCustomerAddress error:', err);
    return { success: false, error: err.message || 'Failed to set default address' };
  }
}

/**
 * Fetch authenticated customer orders strictly bound to user_id
 */
export async function getCustomerOrders(userId) {
  if (!isSupabaseConfigured || !userId) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('[CustomerService] getCustomerOrders note:', error.message);
      return { data: [], error };
    }

    return { data: data || [], error: null };
  } catch (err) {
    console.warn('[CustomerService] getCustomerOrders exception:', err.message);
    return { data: [], error: err };
  }
}
