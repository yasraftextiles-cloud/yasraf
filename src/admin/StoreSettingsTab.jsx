import React, { useState, useEffect } from 'react';
import { 
  Save, AlertCircle, Check, Loader2, Phone, Truck, 
  RefreshCw, ShieldCheck, HelpCircle 
} from 'lucide-react';
import { getStoreSettings, updateStoreSetting } from '../services/supabaseService.js';
import { BRAND_CONFIG } from '../data/brandConfig.js';

export default function StoreSettingsTab() {
  const [whatsappNumber, setWhatsappNumber] = useState(BRAND_CONFIG.whatsappNumber);
  const [whatsappDisplay, setWhatsappDisplay] = useState(BRAND_CONFIG.whatsappDisplay);
  const [shippingFee, setShippingFee] = useState(BRAND_CONFIG.standardShippingFee || 250);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(BRAND_CONFIG.freeShippingThreshold || 4990);
  const [deliveryTimeline, setDeliveryTimeline] = useState('2 - 4 Working Days (via TCS / Leopards Express)');
  const [shippingText, setShippingText] = useState('Complimentary nationwide shipping on orders over Rs. 4,990. Delivered securely in 2–4 working days via TCS or Leopards.');
  const [returnPolicyText, setReturnPolicyText] = useState('7-Day Exchange Window: Unwashed and unworn articles with original tags can be exchanged via our WhatsApp concierge.');

  // Status state
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Load live store settings on mount
  useEffect(() => {
    async function loadSettings() {
      setIsLoading(true);
      try {
        const settings = await getStoreSettings();
        if (settings) {
          if (settings.shipping_config) {
            if (settings.shipping_config.standard_fee) setShippingFee(settings.shipping_config.standard_fee);
            if (settings.shipping_config.free_shipping_threshold) setFreeShippingThreshold(settings.shipping_config.free_shipping_threshold);
            if (settings.shipping_config.delivery_timeline) setDeliveryTimeline(settings.shipping_config.delivery_timeline);
          }
          if (settings.general_settings) {
            if (settings.general_settings.whatsapp_number) setWhatsappNumber(settings.general_settings.whatsapp_number);
            if (settings.general_settings.whatsapp_display) setWhatsappDisplay(settings.general_settings.whatsapp_display);
            if (settings.general_settings.shipping_text) setShippingText(settings.general_settings.shipping_text);
            if (settings.general_settings.return_policy_text) setReturnPolicyText(settings.general_settings.return_policy_text);
          }
        }
      } catch (err) {
        console.warn('Could not load remote store settings:', err);
      } finally {
        setIsLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMsg(null);
    setSaveSuccess(false);

    try {
      // 1. Update shipping_config in store_settings
      await updateStoreSetting('shipping_config', {
        standard_fee: Number(shippingFee),
        free_shipping_threshold: Number(freeShippingThreshold),
        delivery_timeline: deliveryTimeline,
        supported_provinces: [
          'Punjab', 'Sindh', 'Khyber Pakhtunkhwa', 'Balochistan',
          'Islamabad Capital Territory', 'Azad Jammu & Kashmir', 'Gilgit-Baltistan'
        ]
      });

      // 2. Update general_settings in store_settings
      await updateStoreSetting('general_settings', {
        whatsapp_number: whatsappNumber.trim(),
        whatsapp_display: whatsappDisplay.trim(),
        shipping_text: shippingText.trim(),
        return_policy_text: returnPolicyText.trim(),
        support_email: 'contact@yasrafclothing.com'
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Settings save error:', err);
      setErrorMsg(err.message || 'Failed to update store settings.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-8 text-left">
      
      {/* Header */}
      <div className="border-b border-[#ebe6e0] pb-3">
        <h1 
          className="text-2xl sm:text-3xl text-[#1a1814] font-normal tracking-wide"
          style={{ fontFamily: 'var(--font-family-editorial)' }}
        >
          Store Settings & Brand Rules
        </h1>
        <p className="text-[12px] text-[#67615c] mt-0.5">
          Centralized configuration shared between the storefront, checkout calculations, and concierge.
        </p>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div className="p-3.5 bg-[#fdf2f2] border border-[#f5c6cb] text-[#721c24] text-[12.5px] flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {saveSuccess && (
        <div className="p-3.5 bg-[#f0fdf4] border border-[#bbf7d0] text-[#166534] text-[12.5px] flex items-center gap-2">
          <Check size={16} className="shrink-0 text-[#2c6e56]" />
          <span>Store settings saved and updated across the platform!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: WhatsApp Concierge */}
        <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ebe6e0] pb-3">
            <div className="flex items-center gap-2">
              <Phone size={17} className="text-[#25D366]" />
              <h2 className="text-[13px] uppercase tracking-[0.16em] font-semibold text-[#1a1814]">
                VIP WhatsApp Assistance
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] bg-[#2c6e56]/10 text-[#2c6e56] px-2 py-0.5 font-medium">
              Confirmed Business Rule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                WhatsApp Phone Number (International Format)
              </label>
              <input
                type="text"
                required
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                placeholder="923024220514"
                className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] font-mono focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
              />
              <span className="text-[10.5px] text-[#8c867f] mt-1 block">
                Digits only without + or spaces (e.g. 923024220514)
              </span>
            </div>

            <div>
              <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                Display Format (Shown to Customers)
              </label>
              <input
                type="text"
                required
                value={whatsappDisplay}
                onChange={(e) => setWhatsappDisplay(e.target.value)}
                placeholder="+92 302 4220514"
                className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Nationwide Delivery & Charges */}
        <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ebe6e0] pb-3">
            <div className="flex items-center gap-2">
              <Truck size={17} className="text-[#c5a880]" />
              <h2 className="text-[13px] uppercase tracking-[0.16em] font-semibold text-[#1a1814]">
                Shipping Charges & Delivery Timeline
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] bg-[#2c6e56]/10 text-[#2c6e56] px-2 py-0.5 font-medium">
              Confirmed Business Rule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                Standard Shipping Fee (PKR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={shippingFee}
                onChange={(e) => setShippingFee(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
                Free Shipping Threshold (PKR)
              </label>
              <input
                type="number"
                min="0"
                required
                value={freeShippingThreshold}
                onChange={(e) => setFreeShippingThreshold(e.target.value)}
                className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
              />
              <span className="text-[10.5px] text-[#8c867f] mt-1 block">
                Orders equal or exceeding this amount receive Rs. 0 shipping fee.
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
              Promised Delivery Timeline
            </label>
            <input
              type="text"
              required
              value={deliveryTimeline}
              onChange={(e) => setDeliveryTimeline(e.target.value)}
              className="w-full px-3.5 py-2.5 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
            />
          </div>

          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
              Shipping Information Text (Storefront Display)
            </label>
            <textarea
              rows={2}
              value={shippingText}
              onChange={(e) => setShippingText(e.target.value)}
              className="w-full p-3 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
            />
          </div>
        </div>

        {/* Section 3: Returns Policy & Unconfirmed Business Rules */}
        <div className="bg-white border border-[#ebe6e0] p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-[#ebe6e0] pb-3">
            <div className="flex items-center gap-2">
              <RefreshCw size={17} className="text-[#b46146]" />
              <h2 className="text-[13px] uppercase tracking-[0.16em] font-semibold text-[#1a1814]">
                Exchange & Returns Policy
              </h2>
            </div>
            <span className="text-[10px] uppercase tracking-[0.14em] bg-[#b46146]/10 text-[#b46146] px-2 py-0.5 font-medium flex items-center gap-1">
              <HelpCircle size={10} /> Pending Store Owner Review
            </span>
          </div>

          <div>
            <label className="block text-[11.5px] uppercase tracking-[0.14em] font-medium text-[#1a1814] mb-1.5">
              Exchange Policy Terms
            </label>
            <textarea
              rows={3}
              value={returnPolicyText}
              onChange={(e) => setReturnPolicyText(e.target.value)}
              className="w-full p-3 text-[13px] border border-[#ebe6e0] bg-[#faf8f6] focus:bg-white focus:outline-none focus:border-[#c5a880] focus:ring-1 focus:ring-[#c5a880]/30 transition-all"
            />
            <div className="p-2.5 bg-[#faf8f6] border border-[#ebe6e0] mt-2 text-[11.5px] text-[#67615c]">
              <strong>Review Note:</strong> Currently defaulted to a 7-day exchange window for unwashed/unstitched items. Please review and confirm if this aligns with your store's return logistics.
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSaving}
            className="admin-btn-primary inline-flex items-center gap-2 h-11 px-6 text-[12px] font-medium uppercase tracking-[0.16em] cursor-pointer"
          >
            {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            <span>{isSaving ? 'Updating Settings...' : 'Save Store Settings'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}
