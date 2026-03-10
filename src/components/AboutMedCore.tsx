import React from 'react';
import { motion } from 'motion/react';
import { Shield, Zap, Heart, Globe, Users, Activity, CheckCircle2 } from 'lucide-react';

export const AboutMedCore: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-16">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-sm font-bold uppercase tracking-wider"
        >
          <Activity className="w-4 h-4" />
          About MedCore
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-5xl md:text-6xl font-black text-slate-900 leading-tight"
        >
          Your Intelligent <br/>
          <span className="text-brand-600">Health Companion.</span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed"
        >
          MedCore is a comprehensive healthcare platform designed to bridge the gap between complex medical information and everyday health management.
        </motion.p>
      </section>

      {/* Core Mission */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h3 className="text-3xl font-bold text-slate-900">Our Mission</h3>
          <p className="text-lg text-slate-600 leading-relaxed">
            We believe that healthcare should be accessible, understandable, and immediate. MedCore leverages cutting-edge AI technology to provide users with tools that empower them to make informed decisions about their well-being.
          </p>
          <div className="space-y-4">
            {[
              "Democratizing medical knowledge",
              "Ensuring rapid emergency response",
              "Simplifying prescription management",
              "Connecting users with local healthcare"
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 text-slate-700 font-medium">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative rounded-[3rem] overflow-hidden shadow-2xl"
        >
          <img 
            src="https://picsum.photos/seed/med-mission/800/600" 
            alt="Medical Mission" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-brand-600/10 mix-blend-multiply" />
        </motion.div>
      </section>

      {/* Features Grid */}
      <section className="space-y-12">
        <div className="text-center">
          <h3 className="text-3xl font-bold text-slate-900">Why Choose MedCore?</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard 
            icon={<Zap className="w-8 h-8" />}
            title="Instant Analysis"
            description="Get immediate insights into your symptoms and prescriptions using our advanced AI models."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8" />}
            title="Privacy First"
            description="Your health data is sensitive. We prioritize security and privacy in every interaction."
          />
          <FeatureCard 
            icon={<Globe className="w-8 h-8" />}
            title="Local Integration"
            description="Seamlessly connect with hospitals, pharmacies, and ambulance services in your immediate area."
          />
        </div>
      </section>

      {/* Community Section */}
      <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-center space-y-8 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <img src="https://picsum.photos/seed/pattern/1200/800" alt="Pattern" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div className="relative z-10 space-y-6">
          <div className="flex justify-center -space-x-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-12 h-12 rounded-full border-4 border-slate-900 bg-slate-800 overflow-hidden">
                <img src={`https://i.pravatar.cc/150?u=${i}`} alt="User" />
              </div>
            ))}
          </div>
          <h3 className="text-3xl md:text-4xl font-bold text-white">Trusted by thousands of users worldwide.</h3>
          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Join our growing community and take control of your health journey today with MedCore's intelligent tools.
          </p>
        </div>
      </section>

      {/* Developer Credit */}
      <section className="text-center py-8 border-t border-slate-200">
        <p className="text-slate-500 font-medium">
          Developed by <span className="text-brand-600 font-bold">Nahian Tanjim Labib</span>
        </p>
      </section>
    </div>
  );
};

const FeatureCard: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({ icon, title, description }) => (
  <div className="p-10 bg-white border border-slate-100 rounded-[2.5rem] shadow-sm hover:shadow-xl transition-all hover:-translate-y-1 group">
    <div className="w-16 h-16 bg-brand-50 text-brand-600 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-brand-600 group-hover:text-white transition-colors">
      {icon}
    </div>
    <h4 className="text-xl font-bold text-slate-900 mb-4">{title}</h4>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </div>
);
