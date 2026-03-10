import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from './common/Button';
import { Shield, Lock, User, Mail, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLogin: (user: { email: string; name: string; photo?: string }) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    
    const user = {
      email: email.trim(),
      name: name.trim(),
      photo: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name.trim())}`
    };
    onLogin(user);
    localStorage.setItem('medcore_user', JSON.stringify(user));
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-brand-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/5 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full bg-white rounded-[3rem] p-10 shadow-2xl shadow-slate-200/50 border border-slate-100 relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-brand-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-brand-500/20">
            <span className="text-white font-black text-3xl">M</span>
          </div>
          <h1 className="text-3xl font-black text-slate-900 mb-2">Welcome to MedCore</h1>
          <p className="text-slate-500">Your advanced healthcare companion</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Full Name"
              />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                placeholder="Email Address"
              />
            </div>
          </div>

          <Button 
            type="submit"
            className="w-full py-4 rounded-2xl bg-brand-600 text-white hover:bg-brand-700 transition-all flex items-center justify-center gap-3 font-bold shadow-lg shadow-brand-500/30"
          >
            Get Started
            <ArrowRight className="w-5 h-5" />
          </Button>
          
          <div className="relative py-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase tracking-widest font-bold text-slate-400">
              <span className="bg-white px-4">Secure Access</span>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Shield className="w-5 h-5 text-brand-500" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">Privacy Protected</p>
                <p className="text-[10px] text-slate-500">Your data is encrypted and secure</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <Lock className="w-5 h-5 text-brand-500" />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900">HIPAA Compliant</p>
                <p className="text-[10px] text-slate-500">Meeting global healthcare standards</p>
              </div>
            </div>
          </div>
        </form>

        <p className="mt-10 text-center text-[10px] text-slate-400 font-medium leading-relaxed">
          By continuing, you agree to MedCore's <br/>
          <span className="text-brand-600 cursor-pointer hover:underline">Terms of Service</span> and <span className="text-brand-600 cursor-pointer hover:underline">Privacy Policy</span>
        </p>
      </motion.div>
    </div>
  );
};
