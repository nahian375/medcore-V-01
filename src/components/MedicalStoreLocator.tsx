import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../components/common/Button';
import { MapPin, Search, Loader2, Phone, Navigation, ExternalLink, Sparkles, AlertCircle } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface Store {
  name: string;
  address: string;
  uri?: string;
  website?: string;
  contact?: string;
  distance?: string;
}

export const MedicalStoreLocator: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState<Store[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const findNearbyStores = async () => {
    setLoading(true);
    setError(null);
    setExplanation('');
    setStores([]);
    
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = pos.coords;

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the 5 nearest medical stores near my location. Provide their names, full physical addresses, and contact numbers.`,
        config: {
          tools: [{ googleMaps: {} }],
          toolConfig: {
            retrievalConfig: {
              latLng: {
                latitude: latitude,
                longitude: longitude
              }
            }
          }
        },
      });

      const text = response.text || '';
      setExplanation(text);

      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const formattedResults: Store[] = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          name: c.maps.title,
          address: 'View details in summary',
          contact: 'View details in summary',
          website: null,
          uri: c.maps.uri
        }));
      
      setStores(formattedResults);

      if (formattedResults.length === 0) {
        setError('No nearby stores found via Google Maps.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access.');
      } else if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
      } else {
        setError('Failed to detect nearby stores. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-800 overflow-hidden"
      >
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-br from-orange-50/80 dark:from-orange-900/20 via-white dark:via-slate-900 to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-4 bg-orange-600 rounded-[1.5rem] text-white shadow-xl shadow-orange-600/20 ring-4 ring-orange-50 dark:ring-orange-900/20">
              <MapPin className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">Medical Store Locator</h2>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium mt-1">Find pharmacies near your current location.</p>
            </div>
          </div>
          
          <div className="bg-slate-50/80 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-[2rem] border border-slate-200/50 dark:border-slate-700/50 shadow-sm">
            <p className="text-slate-600 mb-8 text-lg">
              We'll use your current location to find the nearest medical stores within a 5km radius.
            </p>
            <Button 
              onClick={findNearbyStores} 
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl px-10 py-6 bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/20 transition-all"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
              <span className="text-lg font-bold">{loading ? 'Detecting Location...' : 'Find Nearby Stores'}</span>
            </Button>
          </div>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl mb-8 flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            {(explanation || stores.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {explanation && (
                  <div className="prose prose-slate max-w-none bg-orange-50/50 dark:bg-orange-900/20 p-10 rounded-[2.5rem] border border-orange-100 dark:border-orange-800/50 shadow-inner dark:prose-invert">
                    <ReactMarkdown>{explanation}</ReactMarkdown>
                  </div>
                )}

                {stores.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-xl">
                        <Sparkles className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Live Results</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                      {stores.map((store, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-8 border-2 border-orange-100 dark:border-orange-800/50 rounded-[2rem] bg-white dark:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 hover:border-orange-300 dark:hover:border-orange-700 transition-all duration-300 group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 dark:bg-orange-900/20 rounded-full -mr-16 -mt-16 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                              <h4 className="text-2xl font-black text-slate-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors tracking-tight leading-tight">{store.name}</h4>
                              <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600 dark:text-orange-400 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:scale-110">
                                <ExternalLink className="w-5 h-5" />
                              </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-3">
                              <a 
                                href={store.website || `https://www.google.com/search?q=${encodeURIComponent(store.name + ' official website')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[140px]"
                              >
                                <Button className="w-full rounded-xl bg-slate-900 dark:bg-slate-800 text-white hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all shadow-md">
                                  {store.website ? 'Website' : 'Search Website'}
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                              </a>

                              <a 
                                href={store.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.name + ' ' + store.address)}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[140px]"
                              >
                                <Button className="w-full rounded-xl bg-orange-600 text-white hover:bg-orange-700 flex items-center justify-center gap-2 py-3 text-sm font-bold transition-all shadow-lg shadow-orange-600/20">
                                  View on Location
                                  <Navigation className="w-4 h-4" />
                                </Button>
                              </a>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {!loading && stores.length === 0 && !explanation && !error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 text-slate-400 dark:text-slate-500"
              >
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 opacity-10 dark:opacity-20" />
                </div>
                <p className="text-xl font-medium text-slate-600 dark:text-slate-400">Ready to search.</p>
                <p className="text-slate-400 dark:text-slate-500 mt-2">Click the button above to find stores near you.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 blur-3xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 animate-spin text-orange-600 dark:text-orange-500 relative z-10" />
                </div>
                <p className="mt-8 text-xl font-bold text-slate-900 dark:text-white">Finding...</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2">We're scanning your area for available pharmacies.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
