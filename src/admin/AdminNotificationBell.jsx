import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Bell, Check, CheckCheck, Clock, ShoppingBag, ExternalLink, X } from 'lucide-react';
import { 
  getAdminNotifications, 
  markNotificationRead, 
  markAllNotificationsRead, 
  subscribeToAdminNotifications 
} from '../services/supabaseService.js';

function formatRelativeTime(dateString) {
  if (!dateString) return 'Just now';
  const now = new Date();
  const date = new Date(dateString);
  const diffSec = Math.floor((now - date) / 1000);

  if (diffSec < 45) return 'Just now';
  if (diffSec < 3600) {
    const mins = Math.floor(diffSec / 60);
    return `${mins}m ago`;
  }
  if (diffSec < 86400) {
    const hours = Math.floor(diffSec / 3600);
    return `${hours}h ago`;
  }
  const days = Math.floor(diffSec / 86400);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-PK', { day: 'numeric', month: 'short' });
}

export default function AdminNotificationBell({ onOpenOrder }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasNewAlert, setHasNewAlert] = useState(false);
  const panelRef = useRef(null);

  const fetchNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getAdminNotifications({ limit: 25 });
      setNotifications(data || []);
    } catch (err) {
      console.warn('Error fetching notifications:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    // Listen to Supabase Realtime for new order notifications
    const unsubscribe = subscribeToAdminNotifications((newNotification) => {
      setNotifications(prev => [newNotification, ...prev]);
      setHasNewAlert(true);
      // Optional subtle audio chime could be played here if supported
      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbqWE2Mmih2+vEYzk0Z6DS6MdgNTRnoNDox2A1NGeg0OjHYDU0Z6DQ6MdgNTRnoNDox2A1NGeg0OjHYDU0');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch {}
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, [fetchNotifications]);

  // Close panel on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  const handleToggle = () => {
    setIsOpen(prev => !prev);
    setHasNewAlert(false);
  };

  const handleMarkRead = async (id, e) => {
    if (e) e.stopPropagation();
    try {
      await markNotificationRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.warn('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.warn('Failed to mark all read:', err);
    }
  };

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      handleMarkRead(notif.id);
    }
    setIsOpen(false);
    if (typeof onOpenOrder === 'function' && (notif.order_number || notif.order_id)) {
      onOpenOrder(notif.order_number || notif.order_id);
    }
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Trigger */}
      <button
        onClick={handleToggle}
        className={`relative p-2 rounded-sm transition-all duration-150 cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#c5a880] ${
          isOpen ? 'bg-[#1a1814] text-white' : 'text-[#1a1814] hover:bg-[#f4efe8]'
        }`}
        title="Admin Notifications"
        aria-label="Open notifications"
      >
        <Bell size={18} className={hasNewAlert ? 'animate-bounce text-[#c5a880]' : ''} />
        
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-[#c5a880] text-[#141311] text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-xs">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#d5cfc4] shadow-2xl z-50 rounded-none overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 bg-[#141311] text-[#f7f4ee] flex items-center justify-between border-b border-[#262320]">
            <div className="flex items-center gap-2">
              <span 
                className="text-sm font-normal tracking-wide"
                style={{ fontFamily: 'var(--font-family-editorial)' }}
              >
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="bg-[#c5a880] text-[#141311] text-[10px] font-bold px-1.5 py-0.2 rounded-xs uppercase tracking-wider">
                  {unreadCount} New
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[10.5px] uppercase tracking-wider text-[#c5a880] hover:text-[#dfc7a7] flex items-center gap-1 font-medium transition-colors cursor-pointer"
              >
                <CheckCheck size={13} />
                <span>Mark All Read</span>
              </button>
            )}
          </div>

          {/* Notification List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-[#f0ece4]">
            {notifications.length === 0 ? (
              <div className="py-12 px-4 text-center text-[#8c867f]">
                <ShoppingBag size={28} className="mx-auto text-[#c5a880]/60 mb-2" strokeWidth={1.5} />
                <p className="text-xs font-medium text-[#1a1814]">No Notifications Yet</p>
                <p className="text-[11px] text-[#8c867f] mt-0.5">
                  New orders will trigger instant alerts here.
                </p>
              </div>
            ) : (
              notifications.map((notif) => {
                const isUnread = !notif.is_read;
                return (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`p-3.5 transition-colors cursor-pointer group ${
                      isUnread ? 'bg-[#faf8f5] hover:bg-[#f4efe8]' : 'bg-white hover:bg-[#faf8f6]'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isUnread ? 'bg-[#c5a880]' : 'bg-transparent'}`} />
                        <span className="text-[9.5px] uppercase tracking-[0.16em] font-bold text-[#c5a880]">
                          {notif.title || 'NEW ORDER RECEIVED'}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#8c867f] flex items-center gap-1 shrink-0">
                        <Clock size={10} />
                        {formatRelativeTime(notif.created_at)}
                      </span>
                    </div>

                    <div className="mt-1 pl-3.5 space-y-0.5 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-[#1a1814]">
                          {notif.order_number || notif.order_id}
                        </span>
                        {notif.total_amount && (
                          <span className="font-semibold text-[#1a1814]">
                            Rs. {Number(notif.total_amount).toLocaleString('en-PK')}
                          </span>
                        )}
                      </div>

                      {notif.customer_name && (
                        <div className="text-[11.5px] text-[#666057]">
                          Customer: <span className="font-medium text-[#1a1814]">{notif.customer_name}</span>
                        </div>
                      )}

                      <div className="pt-2 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-wider font-semibold text-[#1a1814] group-hover:text-[#c5a880] transition-colors">
                          <span>View Order</span>
                          <ExternalLink size={11} />
                        </span>

                        {isUnread && (
                          <button
                            onClick={(e) => handleMarkRead(notif.id, e)}
                            className="text-[10px] text-[#8c867f] hover:text-[#1a1814] px-1.5 py-0.5 border border-[#e5dfd7] bg-white transition-colors cursor-pointer"
                            title="Mark as read"
                          >
                            Mark Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-[#faf8f6] border-t border-[#e5dfd7] text-center text-[11px] text-[#8c867f]">
            <span>Real-time connected via Supabase</span>
          </div>
        </div>
      )}
    </div>
  );
}
