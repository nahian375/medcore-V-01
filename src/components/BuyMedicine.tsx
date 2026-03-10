import React from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, ExternalLink, ShieldCheck, Truck, Clock } from 'lucide-react';

interface Marketplace {
  id: string;
  name: string;
  url: string;
  description: string;
  features: string[];
  color: string;
  logoText: string;
}

const marketplaces: Marketplace[] = [
  {
    id: 'arogga',
    name: 'Arogga',
    url: 'https://www.arogga.com/',
    description: 'One of the largest online pharmacies in Bangladesh offering genuine medicines with home delivery.',
    features: ['Genuine Medicine', 'Cash on Delivery', 'Fast Delivery'],
    color: 'bg-emerald-500',
    logoText: 'A',
  },
  {
    id: 'lazzpharma',
    name: 'Lazz Pharma',
    url: 'https://www.lazzpharma.com/',
    description: 'Trusted retail pharmacy chain in Bangladesh, now offering comprehensive online medicine ordering.',
    features: ['Trusted Brand', 'Wide Range', 'Store Pickup Available'],
    color: 'bg-blue-600',
    logoText: 'L',
  },
  {
    id: 'chaldal',
    name: 'Chaldal Pharmacy',
    url: 'https://chaldal.com/pharmacy',
    description: 'Get your medicines delivered along with your groceries from Chaldal\'s dedicated pharmacy section.',
    features: ['1 Hour Delivery', 'Grocery Integration', 'Easy Returns'],
    color: 'bg-orange-500',
    logoText: 'C',
  },
  {
    id: 'shombhob',
    name: 'Shombhob',
    url: 'https://shombhob.com/',
    description: 'Online healthcare platform providing medicines, healthcare products, and personal care items.',
    features: ['Healthcare Products', 'Discounts', 'Reliable Delivery'],
    color: 'bg-purple-600',
    logoText: 'S',
  },
  {
    id: 'epharma',
    name: 'ePharma',
    url: 'https://www.epharma.com.bd/',
    description: 'A dedicated online pharmacy aiming to provide authentic medicines at your doorstep.',
    features: ['Authentic Products', 'Prescription Upload', '24/7 Support'],
    color: 'bg-teal-500',
    logoText: 'eP',
  },
  {
    id: 'medeasy',
    name: 'MedEasy',
    url: 'https://medeasy.health/',
    description: 'Digital health platform offering online medicine delivery and video consultations.',
    features: ['Video Consultation', 'Medicine Delivery', 'Health Packages'],
    color: 'bg-indigo-500',
    logoText: 'ME',
  }
];

export const BuyMedicine: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-100 text-brand-600 mb-6">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h2 className="text-4xl font-black text-slate-900 mb-4">Buy Medicine Online</h2>
        <p className="text-slate-500 max-w-2xl mx-auto text-lg">
          Order authentic medicines from trusted online pharmacies in Bangladesh. 
          Get your prescriptions delivered directly to your doorstep.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {marketplaces.map((market, index) => (
          <motion.div
            key={market.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-xl transition-all group flex flex-col h-full"
          >
            <div className="flex items-center gap-4 mb-6">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg ${market.color}`}>
                {market.logoText}
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{market.name}</h3>
                <div className="flex items-center gap-1 text-emerald-600 text-sm font-medium mt-1">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verified Partner</span>
                </div>
              </div>
            </div>

            <p className="text-slate-600 mb-6 flex-grow leading-relaxed">
              {market.description}
            </p>

            <div className="space-y-4 mb-8">
              {market.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-slate-200 transition-colors">
                  <div className={`p-2 rounded-lg ${
                    i === 0 ? 'bg-emerald-100 text-emerald-600' :
                    i === 1 ? 'bg-blue-100 text-blue-600' :
                    'bg-purple-100 text-purple-600'
                  }`}>
                    {i === 0 && <ShieldCheck className="w-4 h-4" />}
                    {i === 1 && <Truck className="w-4 h-4" />}
                    {i === 2 && <Clock className="w-4 h-4" />}
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>

            <a 
              href={market.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto w-full py-4 rounded-xl bg-slate-50 text-slate-900 font-bold border border-slate-200 flex items-center justify-center gap-2 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-all"
            >
              Visit Store
              <ExternalLink className="w-5 h-5" />
            </a>
          </motion.div>
        ))}
      </div>

      <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-6 flex gap-4 items-start">
        <ShieldCheck className="w-6 h-6 text-blue-600 shrink-0 mt-1" />
        <div>
          <h4 className="font-bold text-blue-900 mb-2">Safety Notice</h4>
          <p className="text-blue-800 text-sm leading-relaxed">
            MedCore provides these links for your convenience. Always ensure you are buying from verified sellers and consult with your doctor before taking any new medication. A valid prescription is required for restricted medicines.
          </p>
        </div>
      </div>
    </div>
  );
};
