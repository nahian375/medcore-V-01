import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/common/Button';
import { Truck, Search, Loader2, Phone, Navigation, ExternalLink, Sparkles, AlertCircle, Siren } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Ambulance {
  name: string;
  contact: string;
  uri?: string;
  website?: string;
  address?: string;
}

export const AmbulanceService: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [ambulances, setAmbulances] = useState<Ambulance[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const findNearbyAmbulances = async () => {
    setLoading(true);
    setError(null);
    setExplanation('');
    setAmbulances([]);
    
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
        contents: `Find the 5 nearest ambulance services or emergency transport providers near my location. Provide their names, full physical addresses, and contact numbers.`,
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
      const formattedResults: Ambulance[] = chunks
        .filter((c: any) => c.maps)
        .map((c: any) => ({
          name: c.maps.title,
          address: 'View details in summary',
          contact: 'View details in summary',
          website: null,
          uri: c.maps.uri
        }));
      
      setAmbulances(formattedResults);

      if (formattedResults.length === 0) {
        setError('No nearby ambulance services found via Google Maps.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access.');
      } else if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
      } else {
        setError('Failed to detect nearby ambulance services. Please try again.');
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
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-br from-red-50/50 dark:from-red-900/20 via-white dark:via-slate-900 to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-red-500 rounded-2xl text-white shadow-lg shadow-red-500/20">
              <Siren className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Emergency Ambulance</h2>
              <p className="text-slate-500 dark:text-slate-400">Quick access to nearby emergency transport.</p>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm p-8 rounded-[2rem] border border-white dark:border-slate-700/50 shadow-sm">
            <p className="text-slate-600 dark:text-slate-300 mb-8 text-lg">
              In case of emergency, use this tool to find the nearest ambulance services and their contact details.
            </p>
            <Button 
              onClick={findNearbyAmbulances} 
              disabled={loading}
              className="w-full sm:w-auto flex items-center justify-center gap-3 rounded-2xl px-10 py-6 bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Navigation className="w-6 h-6" />}
              <span className="text-lg font-bold">{loading ? 'Locating Services...' : 'Find Nearby Ambulances'}</span>
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

            {(explanation || ambulances.length > 0) && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-10"
              >
                {explanation && (
                  <div className="prose prose-slate max-w-none bg-slate-50/50 dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner dark:prose-invert">
                    <ReactMarkdown>{explanation}</ReactMarkdown>
                  </div>
                )}

                {ambulances.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-5 h-5 text-red-500 dark:text-red-400" />
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">Emergency Contacts</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {ambulances.map((ambulance, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="p-8 border border-slate-100 dark:border-slate-800 rounded-[2rem] bg-white dark:bg-slate-900 hover:shadow-2xl hover:-translate-y-1 hover:border-red-200 dark:hover:border-red-800 transition-all group relative overflow-hidden"
                        >
                          <div className="absolute top-0 right-0 w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <div className="relative z-10">
                            <div className="flex justify-between items-start mb-4">
                              <h4 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">{ambulance.name}</h4>
                              <div className="p-2 bg-red-50 dark:bg-red-900/30 rounded-xl text-red-500 dark:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                                <Phone className="w-5 h-5" />
                              </div>
                            </div>
                            
                            <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-wrap gap-2">
                              <a 
                                href={ambulance.website || `https://www.google.com/search?q=${encodeURIComponent(ambulance.name + ' official website')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[120px]"
                              >
                                <Button className="w-full rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all shadow-md shadow-red-500/10">
                                  {ambulance.website ? 'Website' : 'Search Website'}
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </a>

                              <a 
                                href={ambulance.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ambulance.name + ' ' + (ambulance.address || ''))}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex-1 min-w-[120px]"
                              >
                                <Button className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/10">
                                  View on Location
                                  <Navigation className="w-3 h-3" />
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

            {!loading && ambulances.length === 0 && !explanation && !error && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-24 text-slate-400 dark:text-slate-500"
              >
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Truck className="w-12 h-12 opacity-10 dark:opacity-20" />
                </div>
                <p className="text-xl font-medium text-slate-600 dark:text-slate-400">Emergency assistance ready.</p>
                <p className="text-slate-400 dark:text-slate-500 mt-2">Click the button above to find emergency transport near you.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-24 text-slate-500 dark:text-slate-400"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500/20 dark:bg-red-500/10 blur-3xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 animate-spin text-red-600 dark:text-red-500 relative z-10" />
                </div>
                <p className="mt-8 text-xl font-bold text-slate-900 dark:text-white">Finding...</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-sm">We're finding the fastest way to get you help.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
