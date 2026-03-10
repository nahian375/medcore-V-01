import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  Settings, 
  LogOut, 
  ChevronDown, 
  Shield, 
  FileText, 
  Calendar,
  CreditCard,
  X,
  Check,
  Edit3
} from 'lucide-react';
import { Button } from './common/Button';
import { addNotification } from '../utils/notifications';

export const UserProfile: React.FC<{ 
  user: { email: string; name: string; photo?: string };
  onLogout: () => void;
  onNavigate?: (section: 'profile' | 'records' | 'appointments' | 'billing' | 'settings') => void 
}> = ({ user, onLogout, onNavigate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // User details
  const userEmail = user.email;
  const userName = user.name;
  const userPhoto = user.photo;
  
  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('user_profile');
    const savedProfileData = localStorage.getItem('user_profile_data');
    const profileData = savedProfileData ? JSON.parse(savedProfileData) : {};

    const baseProfile = saved ? JSON.parse(saved) : {
      bloodGroup: 'Not Set',
      age: 'Not Set',
      weight: 'Not Set',
      notifications: {
        bloodDonation: true,
        healthTips: true,
        hospitalUpdates: false,
        pharmacyDeals: false
      }
    };

    return {
      ...baseProfile,
      photo: profileData.photo || user.photo
    };
  });

  const [tempProfile, setTempProfile] = useState(profile);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsEditing(false);
      }
    };

    const handleProfileUpdate = (event: CustomEvent) => {
      setProfile(event.detail);
      setTempProfile(event.detail);
    };

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('profile_updated', handleProfileUpdate as EventListener);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('profile_updated', handleProfileUpdate as EventListener);
    };
  }, []);

  const handleSave = () => {
    setProfile(tempProfile);
    localStorage.setItem('user_profile', JSON.stringify(tempProfile));
    setIsEditing(false);
    
    addNotification({
      topic: 'healthTips',
      title: 'Profile Updated',
      message: 'Your health profile and preferences have been successfully updated.',
      iconType: 'info',
      color: 'bg-blue-100 text-blue-600'
    });

    // Dispatch event for notification center to update
    window.dispatchEvent(new CustomEvent('profile_updated', { detail: tempProfile }));
  };

  const menuItems = [
    { id: 'profile', icon: <User className="w-4 h-4" />, label: 'My Profile', description: 'Personal information' },
    { id: 'records', icon: <FileText className="w-4 h-4" />, label: 'Health Records', description: 'Reports & prescriptions' },
    { id: 'appointments', icon: <Calendar className="w-4 h-4" />, label: 'Appointments', description: 'Upcoming visits' },
    { id: 'billing', icon: <CreditCard className="w-4 h-4" />, label: 'Billing', description: 'Payments & history' },
    { id: 'settings', icon: <Settings className="w-4 h-4" />, label: 'Settings', description: 'Account preferences' },
    { id: 'privacy', icon: <Shield className="w-4 h-4" />, label: 'Privacy', description: 'Security settings' },
  ];

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 p-1.5 pr-3 bg-white border border-slate-200 rounded-2xl hover:border-brand-500 hover:shadow-lg transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center text-brand-600 font-bold border-2 border-white shadow-sm overflow-hidden group-hover:bg-brand-600 group-hover:text-white transition-colors">
          {profile.photo ? (
            <img src={profile.photo} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          ) : (
            userName.charAt(0)
          )}
        </div>
        <div className="hidden md:block text-left">
          <p className="text-sm font-bold text-slate-900 leading-none mb-1">{userName}</p>
          <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Pro Member</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute right-0 mt-3 w-80 bg-white border border-slate-100 rounded-[2rem] shadow-2xl shadow-slate-200/50 overflow-hidden z-[100]"
          >
            <div className="p-6 bg-slate-50 border-b border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-brand-500/20 overflow-hidden">
                    {profile.photo ? (
                      <img src={profile.photo} alt={userName} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    ) : (
                      userName.charAt(0)
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{userName}</h4>
                    <p className="text-xs text-slate-500 truncate max-w-[140px]">{userEmail}</p>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setIsEditing(!isEditing);
                    setTempProfile(profile);
                  }}
                  className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-brand-600 transition-colors"
                >
                  {isEditing ? <X className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                </button>
              </div>

              {isEditing ? (
                <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-inner">
                  <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">Complete Your Profile</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Blood Group</label>
                      <select 
                        value={tempProfile.bloodGroup}
                        onChange={(e) => setTempProfile({...tempProfile, bloodGroup: e.target.value})}
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-brand-500"
                      >
                        <option value="Not Set">Select</option>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500">Age</label>
                      <input 
                        type="number" 
                        value={tempProfile.age === 'Not Set' ? '' : tempProfile.age}
                        onChange={(e) => setTempProfile({...tempProfile, age: e.target.value})}
                        placeholder="Years"
                        className="w-full text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-brand-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500">Weight (kg)</label>
                    <input 
                      type="number" 
                      value={tempProfile.weight === 'Not Set' ? '' : tempProfile.weight}
                      onChange={(e) => setTempProfile({...tempProfile, weight: e.target.value})}
                      placeholder="kg"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-100 rounded-lg outline-none focus:border-brand-500"
                    />
                  </div>

                  <div className="pt-2 space-y-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Notification Preferences</p>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'bloodDonation', label: 'Blood Donation Alerts' },
                        { id: 'healthTips', label: 'Daily Health Tips' },
                        { id: 'hospitalUpdates', label: 'Hospital Updates' },
                        { id: 'pharmacyDeals', label: 'Pharmacy Deals' },
                      ].map((topic) => (
                        <label key={topic.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl cursor-pointer hover:bg-slate-100 transition-colors">
                          <span className="text-[10px] font-bold text-slate-600">{topic.label}</span>
                          <input 
                            type="checkbox" 
                            checked={tempProfile.notifications?.[topic.id] || false}
                            onChange={(e) => setTempProfile({
                              ...tempProfile, 
                              notifications: {
                                ...tempProfile.notifications,
                                [topic.id]: e.target.checked
                              }
                            })}
                            className="w-4 h-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                          />
                        </label>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={handleSave}
                    className="w-full py-2 bg-brand-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Check className="w-3 h-3" />
                    Save Profile
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <div className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Blood</p>
                    <p className={`text-sm font-black ${profile.bloodGroup === 'Not Set' ? 'text-slate-300' : 'text-red-600'}`}>
                      {profile.bloodGroup}
                    </p>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Age</p>
                    <p className={`text-sm font-black ${profile.age === 'Not Set' ? 'text-slate-300' : 'text-slate-900'}`}>
                      {profile.age}{profile.age !== 'Not Set' ? 'y' : ''}
                    </p>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-white rounded-xl border border-slate-200 text-center">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Weight</p>
                    <p className={`text-sm font-black ${profile.weight === 'Not Set' ? 'text-slate-300' : 'text-slate-900'}`}>
                      {profile.weight}{profile.weight !== 'Not Set' ? 'kg' : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-2">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => {
                    if (onNavigate && item.id !== 'privacy') {
                      onNavigate(item.id as any);
                      setIsOpen(false);
                    }
                  }}
                  className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                >
                  <div className="p-2 bg-slate-100 rounded-lg text-slate-500 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{item.label}</p>
                    <p className="text-[10px] text-slate-500">{item.description}</p>
                  </div>
                </button>
              ))}
            </div>

            <div className="p-2 border-t border-slate-50 bg-slate-50/50">
              <button 
                onClick={onLogout}
                className="w-full flex items-center gap-4 p-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors group text-left"
              >
                <div className="p-2 bg-red-100 rounded-lg text-red-600 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  <LogOut className="w-4 h-4" />
                </div>
                <span className="text-sm font-bold">Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
