import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Droplets, MapPin, Phone, Globe, ExternalLink, Loader2, Info, Navigation, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './common/Button';
import { searchRealWorldFacilities } from '../services/geminiService';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';

interface BloodBank {
  id: number;
  name: string;
  address: string;
  contact: string;
  website: string | null;
  latitude: number;
  longitude: number;
  distance?: number;
  isAiResult?: boolean;
  uri?: string;
}

export const BloodBankLocator: React.FC = () => {
  const [query, setQuery] = useState('');
  const [bloodBanks, setBloodBanks] = useState<BloodBank[]>([]);
  const [liveNearbyBanks, setLiveNearbyBanks] = useState<BloodBank[]>([]);
  const [explanation, setExplanation] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [smartLoading, setSmartLoading] = useState(false);
  const [nearbyLoading, setNearbyLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isNearbyActive, setIsNearbyActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (!isNearbyActive) {
        fetchBloodBanks();
      }
    }, 300);
    return () => clearTimeout(delayDebounceFn);
  }, [query, isNearbyActive]);

  const fetchBloodBanks = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = query.trim() 
        ? `/api/blood-banks?query=${encodeURIComponent(query)}`
        : '/api/blood-banks';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setBloodBanks(data);
      }
    } catch (error) {
      console.error('Error fetching blood banks:', error);
      setError('Failed to load blood banks from database.');
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!query.trim()) return;
    setSmartLoading(true);
    setError(null);
    try {
      const aiResults = await searchRealWorldFacilities(query, 'blood_bank');
      const formattedResults: BloodBank[] = aiResults.map((r: any, i: number) => ({
        id: 8888 + i,
        name: r.name,
        address: r.address,
        contact: r.contact || 'N/A',
        website: r.website || null,
        latitude: 23.8103,
        longitude: 90.4125,
        isAiResult: true
      }));
      setBloodBanks(prev => [...prev, ...formattedResults]);
    } catch (error: any) {
      console.error('Smart search failed:', error);
      if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
      } else {
        setError('Smart search failed. Please try again.');
      }
    } finally {
      setSmartLoading(false);
    }
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handleNearbyClick = async () => {
    if (isNearbyActive) {
      setIsNearbyActive(false);
      setLiveNearbyBanks([]);
      setExplanation('');
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setNearbyLoading(true);
    setError(null);
    setExplanation('');
    setLiveNearbyBanks([]);

    try {
      // Check if permission is already denied
      if (navigator.permissions) {
        const status = await navigator.permissions.query({ name: 'geolocation' });
        if (status.state === 'denied') {
          setError('Location access is blocked. Please enable precise location in your browser settings to find nearby blood banks.');
          setNearbyLoading(false);
          return;
        }
      }

      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 5000,
          maximumAge: 300000
        });
      });

      const { latitude, longitude } = pos.coords;
      setUserLocation({ lat: latitude, lng: longitude });
      setIsNearbyActive(true);

      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `Find the 5 nearest blood banks, donation centers, or transfusion centers. Provide their names, full physical addresses, and contact numbers.`,
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
      const formattedResults: BloodBank[] = chunks
        .filter((c: any) => c.maps)
        .map((c: any, i: number) => ({
          id: 7777 + i,
          name: c.maps.title,
          address: 'View details in summary',
          contact: 'View details in summary',
          website: null,
          uri: c.maps.uri,
          latitude: 0,
          longitude: 0,
          isAiResult: true
        }));
      
      setLiveNearbyBanks(formattedResults);

      if (formattedResults.length === 0) {
        setError('No nearby blood banks found via Google Maps.');
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 1) {
        setError('Location permission denied. Please enable location access.');
      } else if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
      } else {
        setError('Failed to detect nearby blood banks. Please try again.');
      }
      setIsNearbyActive(false);
    } finally {
      setNearbyLoading(false);
    }
  };

  const displayBanks = isNearbyActive ? liveNearbyBanks : bloodBanks;

  const filteredBloodBanks = displayBanks
    .filter(bank => 
      !isNearbyActive ? (
        bank.name.toLowerCase().includes(query.toLowerCase()) ||
        bank.address.toLowerCase().includes(query.toLowerCase())
      ) : true
    )
    .map(bank => {
      if (userLocation && bank.latitude !== 0) {
        return { ...bank, distance: calculateDistance(userLocation.lat, userLocation.lng, bank.latitude, bank.longitude) };
      }
      return bank;
    });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold uppercase tracking-wider">
          <Droplets className="w-4 h-4" />
          Life Saver
        </div>
        <h2 className="text-4xl font-black text-slate-900">Blood Point</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Find nearby blood banks and donation centers across Bangladesh. Every drop counts.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 max-w-4xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            disabled={isNearbyActive}
            placeholder={isNearbyActive ? "Search disabled in Nearby mode" : "Search blood banks by name or location..."}
            className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-red-500 focus:ring-4 focus:ring-red-500/10 outline-none transition-all text-lg shadow-sm disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-900 dark:text-white"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleNearbyClick}
            disabled={nearbyLoading}
            className={`px-6 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 shadow-sm ${
              isNearbyActive 
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/20' 
                : 'bg-white text-slate-600 border-2 border-slate-100 hover:border-red-500 hover:text-red-600'
            }`}
          >
            {nearbyLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Navigation className={`w-5 h-5 ${isNearbyActive ? 'animate-pulse' : ''}`} />}
            Nearby
          </button>
          {!isNearbyActive && (
            <button
              onClick={handleSmartSearch}
              disabled={smartLoading || !query.trim()}
              className="px-6 py-4 bg-red-600 text-white rounded-2xl font-bold hover:bg-red-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-red-500/20"
            >
              {smartLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
              <span className="hidden sm:inline">Smart Search</span>
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="max-w-2xl mx-auto p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl flex items-center gap-3"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </motion.div>
        )}

        {isNearbyActive && explanation && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto prose prose-slate prose-red max-w-none bg-red-50/30 dark:bg-red-900/20 p-8 rounded-[2rem] border border-red-100 dark:border-red-800/50 shadow-inner dark:prose-invert"
          >
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </motion.div>
        )}
      </AnimatePresence>

      {loading || nearbyLoading ? (
        <div className="flex flex-col items-center justify-center py-20 space-y-4">
          <div className="relative">
            <div className="absolute inset-0 bg-red-500/20 blur-3xl rounded-full animate-pulse"></div>
            <Loader2 className="w-12 h-12 text-red-500 animate-spin relative z-10" />
          </div>
          <p className="text-slate-900 font-bold text-xl">Requesting Precise Location...</p>
          <p className="text-slate-500 font-medium">Please allow location access to find the nearest blood banks.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredBloodBanks.map((bank, index) => (
              <motion.div
                key={bank.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-red-500"
              >
                <div className="space-y-4">
                  <div className="flex justify-between items-start">
                    <div className="flex gap-2">
                      <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <Droplets className="w-6 h-6" />
                      </div>
                      {bank.isAiResult && (
                        <div className="mt-1 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-600 flex items-center gap-1 h-fit">
                          <Sparkles className="w-2 h-2" />
                          Web Result
                        </div>
                      )}
                    </div>
                    {bank.distance !== undefined && bank.distance > 0 && (
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Distance</span>
                        <p className="text-sm font-black text-red-600">{bank.distance.toFixed(1)} km away</p>
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-red-600 transition-colors leading-tight mb-2">
                      {bank.name}
                    </h3>
                    <div className="flex items-start gap-2 text-slate-500 text-sm mb-3">
                      <MapPin className="w-4 h-4 shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{bank.address}</span>
                    </div>
                    {bank.contact !== 'N/A' && bank.contact !== 'Contact via Maps' && (
                      <div className="flex items-center gap-2 text-slate-500 text-sm">
                        <Phone className="w-4 h-4 shrink-0" />
                        <a href={`tel:${bank.contact}`} className="hover:text-red-600 transition-colors">{bank.contact}</a>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-slate-50 flex flex-wrap gap-2">
                    <a 
                      href={bank.website || `https://www.google.com/search?q=${encodeURIComponent(bank.name + ' official website')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[120px]"
                    >
                      <Button className="w-full rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all shadow-md shadow-red-500/10">
                        {bank.website ? 'Website' : 'Search Website'}
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                    
                    <a 
                      href={
                        bank.uri || 
                        (bank.latitude && bank.longitude && bank.latitude !== 0 
                          ? `https://www.google.com/maps?q=${bank.latitude},${bank.longitude}` 
                          : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(bank.name + ' ' + bank.address)}`)
                      } 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[120px]"
                    >
                      <Button className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/10">
                        View on Location
                        <MapPin className="w-3 h-3" />
                      </Button>
                    </a>

                    {bank.contact !== 'N/A' && bank.contact !== 'Contact via Maps' && (
                      <a 
                        href={`tel:${bank.contact}`}
                        className="p-2 bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all flex items-center justify-center"
                        title="Call"
                      >
                        <Phone className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {!loading && !nearbyLoading && filteredBloodBanks.length === 0 && (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No blood banks found</h3>
          <p className="text-slate-500">Try searching for a different name or location.</p>
        </div>
      )}

      <div className="bg-slate-900 rounded-[2.5rem] p-8 md:p-12 text-white relative overflow-hidden">
        <Droplets className="absolute -right-8 -bottom-8 w-64 h-64 opacity-5 rotate-12" />
        <div className="relative z-10 max-w-3xl">
          <h3 className="text-3xl font-black mb-4">Be a Hero, Donate Blood</h3>
          <p className="text-slate-400 text-lg mb-8 leading-relaxed">
            Your single donation can save up to three lives. Join the community of voluntary donors and help maintain a steady supply of blood for emergencies.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
              <Droplets className="w-5 h-5 text-red-500" />
              <span className="font-bold">24/7 Emergency Support</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl">
              <MapPin className="w-5 h-5 text-red-500" />
              <span className="font-bold">Nationwide Network</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
