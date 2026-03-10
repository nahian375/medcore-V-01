import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/common/Button';
import { MedicalStoreLocator } from '../components/MedicalStoreLocator';
import { SymptomChecker } from '../components/SymptomChecker';
import { HospitalBooking } from '../components/HospitalBooking';
import { PrescriptionExplainer } from '../components/PrescriptionExplainer';
import { AmbulanceService } from '../components/AmbulanceService';
import { AboutMedCore } from '../components/AboutMedCore';
import { TestFacilitySearch } from '../components/TestFacilitySearch';
import { BloodBankLocator } from '../components/BloodBankLocator';
import { UserProfile } from '../components/UserProfile';
import { NotificationCenter } from '../components/NotificationCenter';
import { ProfileDashboard } from '../components/ProfileDashboard';
import { DailyHealthTip } from '../components/DailyHealthTip';
import { MedicineAlarm } from '../components/MedicineAlarm';
import { BuyMedicine } from '../components/BuyMedicine';
import { 
  ArrowLeft, 
  Stethoscope, 
  Building2, 
  Pill, 
  FlaskConical,
  Droplets,
  MapPin, 
  LayoutDashboard, 
  Settings, 
  User, 
  Bell,
  Search,
  ChevronRight,
  ShieldCheck,
  Siren,
  FileText,
  Calendar,
  CreditCard,
  Clock,
  ShoppingBag
} from 'lucide-react';

type View = 'home' | 'stores' | 'symptoms' | 'booking' | 'explainer' | 'ambulance' | 'about' | 'tests' | 'blood' | 'profile' | 'alarm' | 'buy-medicine';

interface HomeProps {
  user: { email: string; name: string; photo?: string };
  onLogout: () => void;
  currentTheme: string;
  onThemeChange: (theme: string) => void;
}

export const Home: React.FC<HomeProps> = ({ user, onLogout, currentTheme, onThemeChange }) => {
  const [view, setView] = useState<View>('home');
  const [profileSection, setProfileSection] = useState<'profile' | 'records' | 'appointments' | 'billing' | 'settings'>('profile');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const SERVICES = [
    { id: 'symptoms', title: 'Symptom Checker', icon: <Stethoscope className="w-4 h-4" />, desc: 'AI diagnostic assistant' },
    { id: 'alarm', title: 'Medicine Alarm', icon: <Clock className="w-4 h-4" />, desc: 'Set daily reminders' },
    { id: 'buy-medicine', title: 'Buy Medicine', icon: <ShoppingBag className="w-4 h-4" />, desc: 'Order from pharmacies' },
    { id: 'stores', title: 'Store Locator', icon: <MapPin className="w-4 h-4" />, desc: 'Find nearby pharmacies' },
    { id: 'blood', title: 'Blood Point', icon: <Droplets className="w-4 h-4" />, desc: 'Find blood banks' },
    { id: 'booking', title: 'Hospital Finder', icon: <Building2 className="w-4 h-4" />, desc: 'Locate healthcare facilities' },
    { id: 'ambulance', title: 'Ambulance', icon: <Siren className="w-4 h-4" />, desc: 'Emergency services' },
    { id: 'tests', title: 'Test Facilities', icon: <FlaskConical className="w-4 h-4" />, desc: 'Compare diagnostic tests' },
    { id: 'explainer', title: 'AI Explainer', icon: <Pill className="w-4 h-4" />, desc: 'Understand prescriptions' },
  ];

  const filteredServices = SERVICES.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    s.desc.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderContent = () => {
    switch (view) {
      case 'stores':
        return <MedicalStoreLocator />;
      case 'symptoms':
        return <SymptomChecker />;
      case 'booking':
        return <HospitalBooking />;
      case 'explainer':
        return <PrescriptionExplainer />;
      case 'ambulance':
        return <AmbulanceService />;
      case 'about':
        return <AboutMedCore />;
      case 'tests':
        return <TestFacilitySearch />;
      case 'blood':
        return <BloodBankLocator />;
      case 'alarm':
        return <MedicineAlarm />;
      case 'buy-medicine':
        return <BuyMedicine />;
      case 'profile':
        return (
          <ProfileDashboard 
            initialSection={profileSection} 
            user={user} 
            currentTheme={currentTheme} 
            onThemeChange={onThemeChange} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] dark:bg-slate-950 flex transition-colors duration-300">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800 p-6 sticky top-0 h-screen transition-colors duration-300">
        <div className="flex items-center gap-3 mb-10 px-2">
          <div className="w-10 h-10 bg-brand-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20">
            <span className="text-white font-bold text-lg">M</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">MedCore</h1>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<LayoutDashboard />} 
            label="Dashboard" 
            active={view === 'home'} 
            onClick={() => setView('home')}
          />
          <SidebarItem 
            icon={<Clock />} 
            label="Medicine Alarm" 
            active={view === 'alarm'} 
            onClick={() => setView('alarm')}
          />
          <SidebarItem 
            icon={<ShoppingBag />} 
            label="Buy Medicine" 
            active={view === 'buy-medicine'} 
            onClick={() => setView('buy-medicine')}
          />
          <SidebarItem 
            icon={<User />} 
            label="My Profile" 
            active={view === 'profile' && profileSection === 'profile'}
            onClick={() => {
              setProfileSection('profile');
              setView('profile');
            }}
          />
          <SidebarItem 
            icon={<FileText />} 
            label="Health Records" 
            active={view === 'profile' && profileSection === 'records'}
            onClick={() => {
              setProfileSection('records');
              setView('profile');
            }}
          />
          <SidebarItem 
            icon={<Calendar />} 
            label="Appointments" 
            active={view === 'profile' && profileSection === 'appointments'}
            onClick={() => {
              setProfileSection('appointments');
              setView('profile');
            }}
          />
          <SidebarItem 
            icon={<CreditCard />} 
            label="Billing" 
            active={view === 'profile' && profileSection === 'billing'}
            onClick={() => {
              setProfileSection('billing');
              setView('profile');
            }}
          />
          <SidebarItem 
            icon={<Settings />} 
            label="Settings" 
            active={view === 'profile' && profileSection === 'settings'}
            onClick={() => {
              setProfileSection('settings');
              setView('profile');
            }}
          />
        </nav>

        <div className="mt-auto p-4 bg-brand-50 dark:bg-brand-900/20 rounded-2xl border border-brand-100 dark:border-brand-800/50">
          <div className="flex items-center gap-2 text-brand-700 dark:text-brand-400 font-semibold mb-1">
            <ShieldCheck className="w-4 h-4" />
            <span className="text-xs uppercase tracking-wider">Pro Plan</span>
          </div>
          <p className="text-xs text-brand-600 dark:text-brand-300 mb-3">Get unlimited AI checks and priority booking.</p>
          <Button size="sm" className="w-full rounded-xl bg-brand-600 hover:bg-brand-700">Upgrade</Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <header className="p-8 flex justify-between items-center sticky top-0 z-50 bg-[#F8F9FA]/80 dark:bg-slate-950/80 backdrop-blur-md transition-colors duration-300">
          <div className="flex items-center gap-4">
            {view !== 'home' && (
              <motion.button 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setView('home')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </motion.button>
            )}
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">
                {view === 'home' ? 'Welcome to MedCore' : 
                 view === 'profile' ? profileSection.charAt(0).toUpperCase() + profileSection.slice(1) : 
                 view === 'blood' ? 'Blood Point' :
                 view.charAt(0).toUpperCase() + view.slice(1)}
              </h2>
              <p className="text-slate-500 dark:text-slate-400">
                {view === 'home' ? 'Your health dashboard is up to date.' : 'Manage your health services.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block z-50">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search services..." 
                className="pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none w-64 transition-all text-slate-900 dark:text-white"
              />
              
              <AnimatePresence>
                {isSearchFocused && searchQuery && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl overflow-hidden"
                  >
                    {filteredServices.length > 0 ? (
                      <div className="max-h-80 overflow-y-auto py-2">
                        {filteredServices.map(service => (
                          <button
                            key={service.id}
                            onClick={() => {
                              setView(service.id as View);
                              setSearchQuery('');
                              setIsSearchFocused(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-left"
                          >
                            <div className="p-2 bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-lg">
                              {service.icon}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-slate-900 dark:text-white">{service.title}</p>
                              <p className="text-xs text-slate-500 dark:text-slate-400">{service.desc}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="p-4 text-center text-sm text-slate-500 dark:text-slate-400">
                        No services found matching "{searchQuery}"
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <NotificationCenter />
            <UserProfile 
              user={user}
              onLogout={onLogout}
              onNavigate={(section) => {
                setProfileSection(section);
                setView('profile');
              }} 
            />
          </div>
        </header>

        <div className="px-8 pb-12">
          <AnimatePresence mode="wait">
            <motion.div
              key={view + (view === 'profile' ? profileSection : '')}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'home' ? (
                <>
                  <DailyHealthTip />
                  {/* Hero Section */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative h-[450px] rounded-[3rem] overflow-hidden mb-12 bg-slate-900 group shadow-2xl shadow-brand-500/10"
                  >
                    <img 
                      src="https://picsum.photos/seed/medical-center/1600/900" 
                      alt="Medical Center" 
                      className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/20 to-transparent p-16 flex flex-col justify-end">
                      <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="max-w-2xl"
                      >
                        <h3 className="text-6xl font-bold text-white mb-6 leading-tight">Modern Healthcare, <br/><span className="text-brand-400">Simplified.</span></h3>
                        <p className="text-xl text-slate-200 mb-8 leading-relaxed">
                          Experience a new era of medical assistance. From instant symptom analysis to emergency coordination, MedCore is your dedicated health partner.
                        </p>
                        <div className="flex gap-4">
                          <Button size="lg" className="rounded-2xl bg-brand-500 text-white hover:bg-brand-600 px-10 py-7 text-lg" onClick={() => setView('symptoms')}>
                            Start Health Check
                          </Button>
                          <Button 
                            size="lg" 
                            className="rounded-2xl bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 px-10 py-7 text-lg"
                            onClick={() => setView('about')}
                          >
                            Learn More
                          </Button>
                        </div>
                      </motion.div>
                    </div>
                  </motion.div>

                  {/* Bento Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    <BentoCard 
                      icon={<FlaskConical className="w-8 h-8" />}
                      title="Test Facilities"
                      description="Search hospitals by diagnostic tests and compare prices."
                      color="orange"
                      onClick={() => setView('tests')}
                      delay={0.05}
                      image="https://picsum.photos/seed/lab/400/300"
                    />
                    <BentoCard 
                      icon={<Stethoscope className="w-8 h-8" />}
                      title="Symptom Checker"
                      description="Analyze your health concerns with our advanced AI diagnostic assistant."
                      color="emerald"
                      onClick={() => setView('symptoms')}
                      delay={0.1}
                      image="https://picsum.photos/seed/doctor/400/300"
                    />
                    <BentoCard 
                      icon={<Droplets className="w-8 h-8" />}
                      title="Blood Point"
                      description="Find nearby blood banks and donation centers instantly."
                      color="red"
                      onClick={() => setView('blood')}
                      delay={0.15}
                      image="https://picsum.photos/seed/blood/400/300"
                    />
                    <BentoCard 
                      icon={<Clock className="w-8 h-8" />}
                      title="Medicine Alarm"
                      description="Set reminders for your medications and never miss a dose."
                      color="blue"
                      onClick={() => setView('alarm')}
                      delay={0.25}
                      image="https://picsum.photos/seed/alarm/400/300"
                    />
                    <BentoCard 
                      icon={<ShoppingBag className="w-8 h-8" />}
                      title="Buy Medicine"
                      description="Order authentic medicines online from trusted pharmacies in Bangladesh."
                      color="emerald"
                      onClick={() => setView('buy-medicine')}
                      delay={0.28}
                      image="https://picsum.photos/seed/pharmacy-delivery/400/300"
                    />
                    <BentoCard 
                      icon={<Building2 className="w-8 h-8" />}
                      title="Hospital Finder"
                      description="Locate the best healthcare facilities near you and visit their portals."
                      color="blue"
                      onClick={() => setView('booking')}
                      delay={0.2}
                      image="https://picsum.photos/seed/hospital/400/300"
                    />
                    <BentoCard 
                      icon={<Pill className="w-8 h-8" />}
                      title="AI Explainer"
                      description="Upload prescriptions to understand your medication in simple terms."
                      color="purple"
                      onClick={() => setView('explainer')}
                      delay={0.3}
                      image="https://picsum.photos/seed/pills/400/300"
                    />
                    <BentoCard 
                      icon={<MapPin className="w-8 h-8" />}
                      title="Store Locator"
                      description="Find pharmacies and medical stores near your current location instantly."
                      color="orange"
                      onClick={() => setView('stores')}
                      delay={0.4}
                      image="https://picsum.photos/seed/pharmacy/800/300"
                    />
                    <BentoCard 
                      icon={<Siren className="w-8 h-8" />}
                      title="Ambulance"
                      description="Quickly find and contact emergency ambulance services in your vicinity."
                      color="red"
                      onClick={() => setView('ambulance')}
                      delay={0.5}
                      image="https://picsum.photos/seed/ambulance/400/300"
                    />
                    <div className="bento-card bg-brand-600 text-white flex flex-col justify-center items-center text-center p-12 relative overflow-hidden group">
                      <div className="absolute inset-0 bg-brand-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="relative z-10">
                        <h4 className="text-3xl font-bold mb-4">Need Help?</h4>
                        <p className="text-brand-100 mb-4 text-lg">Our support team is available 24/7 for your health queries.</p>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 mb-6 border border-white/20">
                          <p className="text-sm font-medium text-brand-100 uppercase tracking-wider mb-1">Emergency Hotline</p>
                          <a href="tel:01310602597" className="text-2xl font-black text-white hover:text-brand-200 transition-colors">01310602597</a>
                        </div>
                        <Button className="bg-white text-brand-600 hover:bg-brand-50 rounded-2xl px-10 py-6 text-lg font-bold shadow-xl">Contact Us</Button>
                      </div>
                    </div>
                  </div>

                  <footer className="mt-16 py-6 text-center border-t border-slate-200/60">
                    <p className="text-slate-400 text-sm font-medium">
                      Developed by <span className="text-slate-600 font-bold">Md Nahian Tanjim Labib</span> CSE' CUET
                    </p>
                  </footer>
                </>
              ) : renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};

const SidebarItem: React.FC<{ icon: React.ReactNode; label: string; active?: boolean; onClick?: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${
      active 
        ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 font-semibold' 
        : 'text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
    }`}
  >
    {React.isValidElement(icon) && React.cloneElement(icon as React.ReactElement<any>, { className: 'w-5 h-5' })}
    <span>{label}</span>
  </button>
);

const BentoCard: React.FC<{ 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: 'emerald' | 'blue' | 'purple' | 'orange' | 'red';
  onClick: () => void;
  delay: number;
  className?: string;
  image?: string;
}> = ({ icon, title, description, color, onClick, delay, className, image }) => {
  const colorMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 group-hover:bg-blue-500 group-hover:text-white',
    purple: 'bg-purple-50 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 group-hover:bg-purple-500 group-hover:text-white',
    orange: 'bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 group-hover:bg-orange-500 group-hover:text-white',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 group-hover:bg-red-500 group-hover:text-white',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      onClick={onClick}
      className={`bento-card group cursor-pointer relative overflow-hidden min-h-[320px] flex flex-col justify-end p-8 ${className}`}
    >
      {image && (
        <img 
          src={image} 
          alt={title} 
          className="absolute inset-0 w-full h-full object-cover opacity-10 dark:opacity-20 group-hover:opacity-20 dark:group-hover:opacity-30 group-hover:scale-110 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
      )}
      <div className="relative z-10">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-all duration-500 shadow-lg ${colorMap[color]}`}>
          {icon}
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-6">{description}</p>
        <div className="flex items-center text-sm font-bold text-slate-900 dark:text-white group-hover:gap-2 transition-all">
          Explore Service
          <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all" />
        </div>
      </div>
    </motion.div>
  );
};
