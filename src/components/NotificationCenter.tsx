import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, Info, Droplets, Stethoscope, Building2, Pill, Check } from 'lucide-react';

interface Notification {
  id: string;
  topic: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  iconType: 'info' | 'blood' | 'health' | 'hospital' | 'pharmacy' | 'alarm';
  color: string;
}

const getIcon = (type: string) => {
  switch (type) {
    case 'blood': return <Droplets className="w-4 h-4" />;
    case 'health': return <Stethoscope className="w-4 h-4" />;
    case 'hospital': return <Building2 className="w-4 h-4" />;
    case 'pharmacy': return <Pill className="w-4 h-4" />;
    case 'alarm': return <Pill className="w-4 h-4" />;
    default: return <Info className="w-4 h-4" />;
  }
};

const DEFAULT_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    topic: 'bloodDonation',
    title: 'Urgent: O+ Blood Needed',
    message: 'A patient at Dhaka Medical College needs O+ blood urgently.',
    time: '2 mins ago',
    read: false,
    iconType: 'blood',
    color: 'bg-red-100 text-red-600'
  },
  {
    id: '2',
    topic: 'healthTips',
    title: 'Daily Health Tip',
    message: 'Stay hydrated! Drink at least 8 glasses of water today.',
    time: '1 hour ago',
    read: false,
    iconType: 'health',
    color: 'bg-emerald-100 text-emerald-600'
  }
];

export const NotificationCenter: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = () => {
    const savedNotifications = localStorage.getItem('user_notifications');
    const savedProfile = localStorage.getItem('user_profile');
    const profile = savedProfile ? JSON.parse(savedProfile) : { notifications: { bloodDonation: true, healthTips: true, hospitalUpdates: true, pharmacyDeals: true } };
    
    let allNotifs = savedNotifications ? JSON.parse(savedNotifications) : DEFAULT_NOTIFICATIONS;
    
    // Filter by user preferences
    const filtered = allNotifs.filter((n: Notification) => profile.notifications?.[n.topic] !== false);
    setNotifications(filtered);
  };

  useEffect(() => {
    loadNotifications();
    
    const handleProfileUpdate = () => loadNotifications();
    const handleNewNotification = (event: any) => {
      const newNotif = event.detail;
      const savedNotifications = localStorage.getItem('user_notifications');
      let allNotifs = savedNotifications ? JSON.parse(savedNotifications) : DEFAULT_NOTIFICATIONS;
      
      const updatedNotifs = [newNotif, ...allNotifs].slice(0, 50); // Keep last 50
      localStorage.setItem('user_notifications', JSON.stringify(updatedNotifs));
      loadNotifications();
    };

    window.addEventListener('profile_updated', handleProfileUpdate);
    window.addEventListener('new_notification', handleNewNotification);
    
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('profile_updated', handleProfileUpdate);
      window.removeEventListener('new_notification', handleNewNotification);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    const updated = notifications.map(n => n.id === id ? { ...n, read: true } : n);
    setNotifications(updated);
    
    const savedNotifications = localStorage.getItem('user_notifications');
    if (savedNotifications) {
      const allNotifs = JSON.parse(savedNotifications);
      const updatedAll = allNotifs.map((n: any) => n.id === id ? { ...n, read: true } : n);
      localStorage.setItem('user_notifications', JSON.stringify(updatedAll));
    }
  };

  const markAllAsRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    
    const savedNotifications = localStorage.getItem('user_notifications');
    if (savedNotifications) {
      const allNotifs = JSON.parse(savedNotifications);
      const updatedAll = allNotifs.map((n: any) => ({ ...n, read: true }));
      localStorage.setItem('user_notifications', JSON.stringify(updatedAll));
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors relative group"
      >
        <Bell className={`w-5 h-5 transition-colors ${isOpen ? 'text-brand-600' : 'text-slate-600 group-hover:text-brand-600'}`} />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 md:w-96 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden z-[100]"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h4 className="font-bold text-slate-900">Notifications</h4>
                <p className="text-xs text-slate-500">You have {unreadCount} unread alerts</p>
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllAsRead}
                  className="text-xs font-bold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                >
                  <Check className="w-3 h-3" />
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-[400px] overflow-y-auto">
              {notifications.length > 0 ? (
                <div className="divide-y divide-slate-50">
                  {notifications.map((n) => (
                    <div 
                      key={n.id} 
                      className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative group ${!n.read ? 'bg-brand-50/30' : ''}`}
                      onClick={() => markAsRead(n.id)}
                    >
                      {!n.read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
                      )}
                      <div className="flex gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${n.color} shadow-sm`}>
                          {getIcon(n.iconType)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-bold text-slate-900 truncate">{n.title}</p>
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{n.time}</span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-12 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-slate-200" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">All caught up!</p>
                    <p className="text-xs text-slate-500 mt-1">No notifications for your selected topics.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
              <p className="text-[10px] text-slate-400">
                Update your <span className="font-bold text-brand-600">Profile Settings</span> to manage notification topics.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
