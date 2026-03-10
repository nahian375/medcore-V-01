import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  User, 
  FileText, 
  Calendar, 
  CreditCard, 
  Settings, 
  Shield, 
  Plus, 
  Download, 
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CreditCard as CardIcon,
  Bell,
  Lock,
  Moon,
  Sun,
  Smartphone,
  Heart,
  Activity,
  Thermometer,
  Weight,
  Droplets,
  Building2,
  Palette,
  Camera
} from 'lucide-react';
import { Button } from './common/Button';

type Section = 'profile' | 'records' | 'appointments' | 'billing' | 'settings';

interface ProfileDashboardProps {
  initialSection?: Section;
  user: { email: string; name: string; photo?: string };
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const ProfileDashboard: React.FC<ProfileDashboardProps> = ({ 
  initialSection = 'profile',
  user,
  currentTheme,
  onThemeChange
}) => {
  const [activeSection, setActiveSection] = useState<Section>(initialSection);

  const sidebarItems = [
    { id: 'profile', icon: <User />, label: 'My Profile' },
    { id: 'records', icon: <FileText />, label: 'Health Records' },
    { id: 'appointments', icon: <Calendar />, label: 'Appointments' },
    { id: 'billing', icon: <CreditCard />, label: 'Billing & Insurance' },
    { id: 'settings', icon: <Settings />, label: 'Settings' },
  ];

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return <ProfileSection user={user} />;
      case 'records': return <RecordsSection />;
      case 'appointments': return <AppointmentsSection />;
      case 'billing': return <BillingSection />;
      case 'settings': return (
        <SettingsSection 
          currentTheme={currentTheme} 
          onThemeChange={onThemeChange} 
        />
      );
      default: return <ProfileSection user={user} />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="bg-white border border-slate-100 rounded-[2rem] p-4 shadow-sm sticky top-24">
            <nav className="space-y-1">
              {sidebarItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveSection(item.id as Section)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
                    activeSection === item.id 
                      ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  {React.cloneElement(item.icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
                  <span className="font-bold text-sm">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderSection()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const ProfileSection: React.FC<{ user: { email: string; name: string; photo?: string } }> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState(() => {
    const saved = localStorage.getItem('user_profile_data');
    const savedUserProfile = localStorage.getItem('user_profile');
    const userProfile = savedUserProfile ? JSON.parse(savedUserProfile) : {};
    
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with user_profile if available for shared fields
      return {
        ...parsed,
        age: parsed.age || userProfile.age || '',
        weight: parsed.weight || userProfile.weight || '',
        bloodGroup: parsed.bloodGroup || userProfile.bloodGroup || '',
        height: parsed.height || ''
      };
    }
    
    return {
      phone: '',
      address: '',
      emergencyName: '',
      emergencyRelation: '',
      emergencyPhone: '',
      age: userProfile.age || '',
      weight: userProfile.weight || '',
      height: '',
      bloodGroup: userProfile.bloodGroup || '',
      name: user.name,
      email: user.email
    };
  });

  const handleSave = () => {
    localStorage.setItem('user_profile_data', JSON.stringify(profileData));
    
    // Also update user_profile for UserProfile.tsx sync
    const savedUserProfile = localStorage.getItem('user_profile');
    const userProfile = savedUserProfile ? JSON.parse(savedUserProfile) : {};
    const updatedUserProfile = {
      ...userProfile,
      age: profileData.age,
      weight: profileData.weight,
      bloodGroup: profileData.bloodGroup
    };
    localStorage.setItem('user_profile', JSON.stringify(updatedUserProfile));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('profile_updated', { detail: updatedUserProfile }));
    
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative">
              <div className="w-32 h-32 rounded-[2.5rem] bg-brand-600 flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-brand-500/20 overflow-hidden">
                {profileData.photo || user.photo ? (
                  <img src={profileData.photo || user.photo} alt={user.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  user.name.charAt(0)
                )}
              </div>
              <label className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl shadow-xl text-brand-600 dark:text-brand-400 hover:scale-110 transition-transform cursor-pointer">
                <Camera className="w-5 h-5" />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setProfileData({...profileData, photo: reader.result as string});
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                />
              </label>
            </div>
            <div className="text-center md:text-left">
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">{user.name}</h2>
              <p className="text-slate-500 dark:text-slate-400 mb-4">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <span className="px-4 py-1.5 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-full text-xs font-bold border border-brand-100 dark:border-brand-800">Pro Member</span>
                <span className="px-4 py-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-full text-xs font-bold border border-emerald-100 dark:border-emerald-800">Verified Identity</span>
              </div>
            </div>
          </div>
          <Button 
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
            className={`rounded-2xl px-8 py-4 font-bold transition-all ${
              isEditing ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
            }`}
          >
            {isEditing ? 'Save Changes' : 'Edit Profile'}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <User className="w-5 h-5 text-brand-500" />
                Personal Information
              </h3>
              <button 
                onClick={() => isEditing ? handleSave() : setIsEditing(true)}
                className="text-xs font-bold text-brand-600 dark:text-brand-400 hover:text-brand-700 dark:hover:text-brand-300 hover:bg-brand-50 dark:hover:bg-brand-900/30 px-3 py-1.5 rounded-lg transition-colors"
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Full Name</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.name || user.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.name || user.name}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Email</label>
                  {isEditing ? (
                    <input 
                      type="email" 
                      value={profileData.email || user.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.email || user.email}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone Number</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.phone}
                      onChange={(e) => setProfileData({...profileData, phone: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. +1 234 567 8900"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.phone || 'Not Set'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Address</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.address}
                      onChange={(e) => setProfileData({...profileData, address: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. 123 Main St, City"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.address || 'Not Set'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Age</label>
                  {isEditing ? (
                    <input 
                      type="number" 
                      value={profileData.age === 'Not Set' ? '' : profileData.age}
                      onChange={(e) => setProfileData({...profileData, age: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. 25"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.age ? `${profileData.age} years` : 'Not Set'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Group</label>
                  {isEditing ? (
                    <select 
                      value={profileData.bloodGroup === 'Not Set' ? '' : profileData.bloodGroup}
                      onChange={(e) => setProfileData({...profileData, bloodGroup: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                    >
                      <option value="" disabled>Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.bloodGroup || 'Not Set'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Weight</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.weight === 'Not Set' ? '' : profileData.weight}
                      onChange={(e) => setProfileData({...profileData, weight: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. 70 kg"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.weight || 'Not Set'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Height</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.height === 'Not Set' ? '' : profileData.height}
                      onChange={(e) => setProfileData({...profileData, height: e.target.value})}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. 175 cm"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.height || 'Not Set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-brand-500" />
              Emergency Contact
            </h3>
            <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-[2rem] border border-slate-100 dark:border-slate-700 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Name</label>
                {isEditing ? (
                  <input 
                    type="text" 
                    value={profileData.emergencyName}
                    onChange={(e) => setProfileData({...profileData, emergencyName: e.target.value})}
                    className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                    placeholder="e.g. Jane Doe"
                  />
                ) : (
                  <p className="font-bold text-slate-900 dark:text-white">{profileData.emergencyName || 'Not Set'}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Relation</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.emergencyRelation}
                      onChange={(e) => setProfileData({...profileData, emergencyRelation: e.target.value})}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. Spouse"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.emergencyRelation || 'Not Set'}</p>
                  )}
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Phone</label>
                  {isEditing ? (
                    <input 
                      type="text" 
                      value={profileData.emergencyPhone}
                      onChange={(e) => setProfileData({...profileData, emergencyPhone: e.target.value})}
                      className="w-full p-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:border-brand-500 font-bold text-sm text-slate-900 dark:text-white"
                      placeholder="e.g. +1 234 567 8900"
                    />
                  ) : (
                    <p className="font-bold text-slate-900 dark:text-white">{profileData.emergencyPhone || 'Not Set'}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard icon={<Thermometer />} label="Height" value={profileData.height || "175 cm"} color="orange" />
        <StatCard icon={<Weight />} label="Weight" value={`${profileData.weight || "72.4"} kg`} color="emerald" />
        <StatCard icon={<Activity />} label="Blood Group" value={profileData.bloodGroup || "O+"} color="purple" />
      </div>
    </div>
  );
};

const RecordsSection = () => {
  const records = [
    { id: 1, title: 'Annual Health Checkup', date: 'Oct 12, 2025', type: 'Report', size: '2.4 MB' },
    { id: 2, title: 'Chest X-Ray Result', date: 'Sep 28, 2025', type: 'Imaging', size: '15.8 MB' },
    { id: 3, title: 'Blood Test Panel', date: 'Aug 15, 2025', type: 'Lab', size: '1.1 MB' },
    { id: 4, title: 'COVID-19 Vaccination', date: 'Jan 20, 2025', type: 'Vaccine', size: '0.5 MB' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-black text-slate-900">Health Records</h2>
        <Button className="rounded-2xl bg-brand-600 text-white flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Upload New
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {records.map((record) => (
          <div key={record.id} className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center justify-between hover:shadow-xl hover:border-brand-200 transition-all group">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">{record.title}</h4>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {record.date}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full font-bold uppercase tracking-wider">
                    {record.type}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-400 hidden sm:block">{record.size}</span>
              <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AppointmentsSection = () => {
  const appointments = [
    { id: 1, doctor: 'Dr. Ariful Islam', specialty: 'Cardiologist', date: 'Tomorrow, 10:30 AM', status: 'Confirmed', hospital: 'Evercare Hospital' },
    { id: 2, doctor: 'Dr. Nusrat Jahan', specialty: 'Dermatologist', date: 'Oct 25, 2025, 04:15 PM', status: 'Pending', hospital: 'Square Hospital' },
    { id: 3, doctor: 'Dr. Kamal Ahmed', specialty: 'General Physician', date: 'Sep 12, 2025, 11:00 AM', status: 'Completed', hospital: 'MedCore Clinic' },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black text-slate-900 mb-2">My Appointments</h2>
      
      <div className="space-y-4">
        {appointments.map((app) => (
          <div key={app.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 hover:shadow-xl transition-all">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-5">
                <div className="w-16 h-16 rounded-[1.5rem] bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900">{app.doctor}</h4>
                  <p className="text-brand-600 font-bold text-sm mb-2">{app.specialty}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" /> {app.hospital}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {app.date}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-widest flex items-center gap-2 ${
                  app.status === 'Confirmed' ? 'bg-emerald-50 text-emerald-600' :
                  app.status === 'Pending' ? 'bg-orange-50 text-orange-600' :
                  'bg-slate-50 text-slate-400'
                }`}>
                  {app.status === 'Confirmed' ? <CheckCircle2 className="w-4 h-4" /> : 
                   app.status === 'Pending' ? <Clock className="w-4 h-4" /> : 
                   <CheckCircle2 className="w-4 h-4" />}
                  {app.status}
                </div>
                <button className="p-3 bg-slate-50 rounded-2xl text-slate-400 hover:bg-brand-50 hover:text-brand-600 transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BillingSection = () => {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Payment Methods</h2>
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden group shadow-2xl shadow-slate-900/20">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-white/10 transition-all duration-700" />
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-12">
                <CardIcon className="w-10 h-10 text-brand-400" />
                <span className="text-xs font-black uppercase tracking-[0.2em] opacity-60">Visa Platinum</span>
              </div>
              <p className="text-2xl font-mono tracking-[0.25em] mb-8">•••• •••• •••• 4242</p>
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Card Holder</p>
                  <p className="text-sm font-bold tracking-wider">MD NAHIAN TANJIM</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-bold uppercase opacity-40 mb-1">Expires</p>
                  <p className="text-sm font-bold tracking-wider">12/28</p>
                </div>
              </div>
            </div>
          </div>
          <Button variant="outline" className="w-full rounded-2xl py-4 border-dashed border-2 border-slate-200 text-slate-400 hover:border-brand-500 hover:text-brand-600 transition-all flex items-center justify-center gap-2">
            <Plus className="w-5 h-5" />
            Add New Card
          </Button>
        </div>

        <div className="space-y-6">
          <h2 className="text-2xl font-black text-slate-900">Insurance Plan</h2>
          <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Shield className="w-8 h-8" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900">MetLife Health Plus</h4>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Policy #ML-99281-X</p>
              </div>
            </div>
            <div className="space-y-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Coverage Limit</span>
                <span className="text-sm font-black text-slate-900">৳ 5,00,000</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500">Remaining</span>
                <span className="text-sm font-black text-emerald-600">৳ 4,20,000</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[84%] h-full bg-emerald-500 rounded-full" />
              </div>
            </div>
            <Button className="w-full rounded-2xl bg-slate-900 text-white hover:bg-slate-800">View Policy Details</Button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-black text-slate-900">Recent Transactions</h2>
        <div className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
          {[
            { id: 1, title: 'Consultation Fee', date: 'Oct 12, 2025', amount: '-৳ 1,500', status: 'Success' },
            { id: 2, title: 'Medicine Purchase', date: 'Oct 05, 2025', amount: '-৳ 2,420', status: 'Success' },
            { id: 3, title: 'Lab Test Payment', date: 'Sep 28, 2025', amount: '-৳ 4,800', status: 'Success' },
          ].map((tx) => (
            <div key={tx.id} className="p-6 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{tx.title}</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-black text-slate-900">{tx.amount}</p>
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{tx.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SettingsSection: React.FC<{ currentTheme: string; onThemeChange: (theme: string) => void }> = ({ currentTheme, onThemeChange }) => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState('Detecting device...');

  useEffect(() => {
    // Check initial dark mode preference
    if (document.documentElement.classList.contains('dark') || 
        (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
    }

    // Detect real device info
    const ua = navigator.userAgent;
    let device = "Unknown Device";
    if (/android/i.test(ua)) device = "Android Device";
    else if (/iPad|iPhone|iPod/.test(ua)) device = "iOS Device";
    else if (/Windows/.test(ua)) device = "Windows PC";
    else if (/Mac OS X/.test(ua)) device = "Mac";
    else if (/Linux/.test(ua)) device = "Linux PC";
    
    let browser = "Browser";
    if (/Edg/.test(ua)) browser = "Edge";
    else if (/Chrome/.test(ua)) browser = "Chrome";
    else if (/Firefox/.test(ua)) browser = "Firefox";
    else if (/Safari/.test(ua)) browser = "Safari";

    setDeviceInfo(`${device} • ${browser}`);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    if (!isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const themes = [
    { id: 'classic', label: 'Classic Med', color: 'bg-emerald-500', description: 'Fresh emerald green' },
    { id: 'midnight', label: 'Midnight Healing', color: 'bg-indigo-500', description: 'Deep indigo patterns' },
    { id: 'ocean', label: 'Ocean Care', color: 'bg-sky-500', description: 'Calming blue waves' },
    { id: 'sunset', label: 'Sunset Health', color: 'bg-rose-500', description: 'Warm energetic rose' },
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Account Settings</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Palette className="w-5 h-5 text-brand-500" />
              App Theme
            </h3>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">Dark Mode</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Switch to a darker interface</p>
              </div>
              <button 
                onClick={toggleDarkMode}
                className={`w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-brand-600' : 'bg-slate-200 dark:bg-slate-700'}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isDarkMode ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">Choose a color pattern that suits your preference.</p>
            <div className="grid grid-cols-1 gap-3">
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => onThemeChange(theme.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    currentTheme === theme.id 
                      ? 'border-brand-500 bg-brand-50/50 dark:bg-brand-900/20 shadow-md' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-xl ${theme.color} shadow-lg`} />
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{theme.label}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{theme.description}</p>
                  </div>
                  {currentTheme === theme.id && (
                    <div className="w-6 h-6 bg-brand-500 rounded-full flex items-center justify-center text-white">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Bell className="w-5 h-5 text-brand-500" />
              Notifications
            </h3>
            <div className="space-y-4">
              <ToggleItem label="Push Notifications" description="Receive alerts on your device" active />
              <ToggleItem label="Email Reports" description="Weekly health summaries" active />
              <ToggleItem label="Appointment Reminders" description="24h before your visit" active />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-brand-500" />
              Security
            </h3>
            <div className="space-y-4">
              <ToggleItem label="Two-Factor Auth" description="Extra layer of security" />
              <ToggleItem label="Biometric Login" description="Use FaceID or Fingerprint" active />
            </div>
            <Button variant="outline" className="w-full rounded-2xl border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 dark:hover:border-brand-800">
              Change Password
            </Button>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-brand-500" />
              Connected Devices
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-slate-400 shadow-sm">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">{deviceInfo}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Last active: Now (This Device)</p>
                  </div>
                </div>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded-md">Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string; color: 'orange' | 'emerald' | 'purple' }> = ({ icon, label, value, color }) => {
  const colors = {
    orange: 'bg-orange-50 text-orange-600 border-orange-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} flex items-center gap-4`}>
      <div className="p-3 bg-white rounded-2xl shadow-sm">
        {React.cloneElement(icon as React.ReactElement<any>, { className: 'w-6 h-6' })}
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{label}</p>
        <p className="text-xl font-black">{value}</p>
      </div>
    </div>
  );
};

const ToggleItem: React.FC<{ label: string; description: string; active?: boolean }> = ({ label, description, active = false }) => {
  const [isOn, setIsOn] = useState(active);
  return (
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-bold text-slate-900">{label}</p>
        <p className="text-[10px] text-slate-500 font-medium">{description}</p>
      </div>
      <button 
        onClick={() => setIsOn(!isOn)}
        className={`w-12 h-6 rounded-full transition-all relative ${isOn ? 'bg-brand-600' : 'bg-slate-200'}`}
      >
        <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isOn ? 'left-7' : 'left-1'}`} />
      </button>
    </div>
  );
};
