import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase.js';
import { getAdminProducts, checkIsAdmin } from '../services/supabaseService.js';
import AdminLogin from './AdminLogin.jsx';
import AdminLayout from './AdminLayout.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import ProductEditor from './ProductEditor.jsx';
import StoreSettingsTab from './StoreSettingsTab.jsx';
import CollectionsTab from './CollectionsTab.jsx';
import OrdersTab from './OrdersTab.jsx';
import { Loader2 } from 'lucide-react';

export default function AdminPage({ onBackToStore }) {
  // Session & Auth State
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // View state: 'dashboard' | 'new-product' | 'edit-product' | 'collections' | 'settings'
  const [currentTab, setCurrentTab] = useState('products');
  const [productView, setProductView] = useState('list'); // 'list' | 'new' | 'edit'
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Data state
  const [products, setProducts] = useState([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);

  // 1. Initial Auth & Admin Check
  const verifySession = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) {
        setUser(null);
        setIsAdmin(false);
        setIsAuthLoading(false);
        return;
      }

      setUser(session.user);
      const adminVerified = await checkIsAdmin();
      setIsAdmin(adminVerified);
    } catch (err) {
      console.warn('Session verification notice:', err);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  useEffect(() => {
    verifySession();

    // Listen to Auth State Changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user);
        const adminVerified = await checkIsAdmin();
        setIsAdmin(adminVerified);
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setIsAuthLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [verifySession]);

  // 2. Fetch Live Products for Admin
  const loadAdminProducts = useCallback(async () => {
    if (!isAdmin) return;
    setIsProductsLoading(true);
    try {
      const data = await getAdminProducts();
      setProducts(data || []);
    } catch (err) {
      console.warn('Failed to fetch admin products from Supabase:', err);
    } finally {
      setIsProductsLoading(false);
    }
  }, [isAdmin]);

  useEffect(() => {
    if (isAdmin) {
      loadAdminProducts();
    }
  }, [isAdmin, loadAdminProducts]);

  // 3. Logout Handler
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      setUser(null);
      setIsAdmin(false);
      setProductView('list');
      setCurrentTab('products');
      setSelectedProduct(null);
    }
  };

  // 4. Loading Splash Screen
  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-[#faf8f6] flex flex-col items-center justify-center text-[#8c867f] gap-3">
        <Loader2 size={28} className="animate-spin text-[#c5a880]" />
        <span className="text-[12px] uppercase tracking-[0.2em] font-medium text-[#1a1814]">
          Verifying Atelier Access...
        </span>
      </div>
    );
  }

  // 5. Unauthenticated or Non-Admin -> Render AdminLogin
  if (!user || !isAdmin) {
    return (
      <AdminLogin 
        onLoginSuccess={() => verifySession()}
        onBackToStore={onBackToStore}
      />
    );
  }

  // 6. Authenticated Admin -> Render AdminLayout with Sub-view
  return (
    <AdminLayout
      currentTab={currentTab}
      onSelectTab={(tab) => {
        setCurrentTab(tab);
        setProductView('list');
      }}
      user={user}
      onLogout={handleLogout}
      onViewStore={onBackToStore}
    >
      {/* Tab: Products */}
      {currentTab === 'products' && (
        <>
          {productView === 'list' && (
            <AdminDashboard
              products={products}
              isLoading={isProductsLoading}
              onRefresh={loadAdminProducts}
              onAddNewProduct={() => {
                setSelectedProduct(null);
                setProductView('new');
              }}
              onEditProduct={(prod) => {
                setSelectedProduct(prod);
                setProductView('edit');
              }}
            />
          )}

          {(productView === 'new' || productView === 'edit') && (
            <ProductEditor
              key={productView === 'edit' ? (selectedProduct?.id || 'edit-product') : 'new-product'}
              product={productView === 'edit' ? selectedProduct : null}
              allProducts={products}
              onSaveSuccess={() => {
                setProductView('list');
                loadAdminProducts();
              }}
              onCancel={() => {
                setProductView('list');
                setSelectedProduct(null);
              }}
            />
          )}
        </>
      )}

      {/* Tab: Orders */}
      {currentTab === 'orders' && (
        <OrdersTab />
      )}

      {/* Tab: Collections */}
      {currentTab === 'collections' && (
        <CollectionsTab />
      )}

      {/* Tab: Store Settings */}
      {currentTab === 'settings' && (
        <StoreSettingsTab />
      )}
    </AdminLayout>
  );
}
