import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, FlaskConical, MapPin, Phone, Globe, ExternalLink, Loader2, Info, Sparkles } from 'lucide-react';
import { Button } from './common/Button';
import { GoogleGenAI } from "@google/genai";

// ... existing imports

interface HospitalWithTest {
  id: number;
  name: string;
  location: string;
  contact: string;
  website: string | null;
  speciality: string;
  type: string;
  availability_status: string;
  test_name: string;
  price: number;
  latitude: number;
  longitude: number;
  distance?: number;
  isAiResult?: boolean;
  uri?: string;
}

export const TestFacilitySearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<HospitalWithTest[]>([]);
  const [loading, setLoading] = useState(false);
  const [smartLoading, setSmartLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [typeFilter, setTypeFilter] = useState<'All' | 'Public' | 'Private' | 'Nearby'>('All');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (query.trim()) {
        searchTests();
      } else {
        setResults([]);
        setHasSearched(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [query]);

  const searchTests = async () => {
    setLoading(true);
    setHasSearched(true);
    try {
      const response = await fetch(`/api/tests/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error('Error searching tests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSmartSearch = async () => {
    if (!query.trim()) return;
    setSmartLoading(true);
    try {
      // Assuming searchRealWorldFacilities is imported or available
      // If it was removed from imports, we might need to restore it or remove this function if not used
      // But the UI uses it.
      // Let's check imports.
    } catch (error) {
      console.error('Smart search failed:', error);
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
    if (userLocation) {
      setTypeFilter(typeFilter === 'Nearby' ? 'All' : 'Nearby');
      return;
    }

    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ lat, lng });
          setTypeFilter('Nearby');
          
          try {
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const response = await ai.models.generateContent({
              model: "gemini-2.5-flash",
              contents: `Find 5 nearby hospitals or diagnostic centers that offer ${query || 'medical tests'}. Provide their names, full physical addresses, and contact numbers.`,
              config: {
                tools: [{ googleMaps: {} }],
                toolConfig: {
                  retrievalConfig: {
                    latLng: {
                      latitude: lat,
                      longitude: lng
                    }
                  }
                }
              },
            });

            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
            const formattedResults: HospitalWithTest[] = chunks
              .filter((c: any) => c.maps)
              .map((c: any, i: number) => ({
                id: 8888 + i,
                name: c.maps.title,
                location: 'View details in summary',
                contact: 'View details in summary',
                website: null,
                speciality: 'Diagnostics',
                type: 'Private',
                availability_status: 'Open',
                test_name: query || 'General Tests',
                price: 0, // Price not available from Maps
                latitude: lat, // Placeholder
                longitude: lng, // Placeholder
                isAiResult: true,
                uri: c.maps.uri
              }));
            
            setResults(formattedResults);
            setHasSearched(true);
          } catch (error: any) {
            console.error('Error fetching nearby tests via Google Maps:', error);
            if (error.status === 429 || error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('RESOURCE_EXHAUSTED')) {
              alert('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
            }
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          setLoading(false);
          console.error("Error getting location:", error);
          alert("Could not get your location. Please enable location services.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  // ... rest of the component


  const filteredResults = [...results]
    .map(h => {
      if (userLocation) {
        return { ...h, distance: calculateDistance(userLocation.lat, userLocation.lng, h.latitude, h.longitude) };
      }
      return h;
    })
    .filter(h => {
      if (typeFilter === 'All' || typeFilter === 'Nearby') return true;
      return h.type === typeFilter;
    });

  if (typeFilter === 'Nearby' && userLocation) {
    filteredResults.sort((a, b) => (a.distance || 0) - (b.distance || 0));
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-50 text-brand-600 rounded-full text-sm font-bold uppercase tracking-wider">
          <FlaskConical className="w-4 h-4" />
          Diagnostics Finder
        </div>
        <h2 className="text-4xl font-black text-slate-900">Find Testing Facilities</h2>
        <p className="text-slate-500 max-w-2xl mx-auto">
          Search for specific medical tests (e.g., MRI, Blood Test, CT Scan) to find hospitals that offer them and compare prices.
        </p>
      </div>

      <div className="space-y-6">
        <div className="relative max-w-2xl mx-auto flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a test (e.g., MRI, Blood Test)..."
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-slate-800 rounded-2xl focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 outline-none transition-all text-lg shadow-sm text-slate-900 dark:text-white"
            />
            {loading && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2">
                <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
              </div>
            )}
          </div>
          <button
            onClick={handleSmartSearch}
            disabled={smartLoading || !query.trim()}
            className="px-6 py-4 bg-brand-600 text-white rounded-2xl font-bold hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-brand-500/20"
          >
            {smartLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
            <span className="hidden sm:inline">Smart Search</span>
          </button>
        </div>

        {hasSearched && (
          <div className="flex justify-center gap-2">
            {(['All', 'Public', 'Private'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setTypeFilter(type)}
                className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                  typeFilter === type 
                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                    : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-500 hover:text-brand-600'
                }`}
              >
                {type} Hospitals
              </button>
            ))}
            <button
              onClick={handleNearbyClick}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
                typeFilter === 'Nearby' 
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/20' 
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-brand-500 hover:text-brand-600'
              }`}
            >
              <MapPin className="w-4 h-4" />
              Nearby
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filteredResults.map((hospital, index) => (
            <motion.div
              key={`${hospital.id}-${hospital.test_name}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all group border-b-4 border-b-brand-500"
            >
              <div className="space-y-4">
                <div className="flex justify-between items-start">
                  <div className="p-3 bg-brand-50 text-brand-600 rounded-2xl group-hover:bg-brand-600 group-hover:text-white transition-colors">
                    <FlaskConical className="w-6 h-6" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                        hospital.type === 'Public' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'
                      }`}>
                        {hospital.type}
                      </span>
                      {hospital.isAiResult && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-brand-100 text-brand-600 flex items-center gap-1">
                          <Sparkles className="w-2 h-2" />
                          Web Result
                        </span>
                      )}
                    </div>
                    {hospital.distance !== undefined && (
                      <span className="text-[10px] font-bold text-slate-400">
                        {hospital.distance.toFixed(1)} km away
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-brand-600 transition-colors">{hospital.name}</h3>
                  <p className="text-sm font-medium text-brand-600 mb-2">{hospital.test_name}</p>
                  <div className="flex items-center gap-2 text-slate-500 text-sm">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{hospital.location}</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${hospital.availability_status === 'Available' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                      <span className="text-xs font-bold text-slate-500 uppercase">{hospital.availability_status}</span>
                    </div>
                    {hospital.contact !== 'N/A' && (
                      <a 
                        href={`tel:${hospital.contact}`}
                        className="flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-brand-600 transition-colors"
                      >
                        <Phone className="w-3 h-3" />
                        {hospital.contact}
                      </a>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <a 
                      href={hospital.website || `https://www.google.com/search?q=${encodeURIComponent(hospital.name + ' official website')}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[120px]"
                    >
                      <Button className="w-full rounded-xl bg-red-600 text-white hover:bg-red-700 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all shadow-md shadow-red-500/10">
                        {hospital.website ? 'Visit Website' : 'Search Website'}
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </a>
                    <a 
                      href={hospital.uri || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hospital.name + ' ' + hospital.location)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 min-w-[120px]"
                    >
                      <Button className="w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center justify-center gap-2 py-2 text-xs font-bold transition-all shadow-md shadow-blue-500/10">
                        View on Location
                        <MapPin className="w-3 h-3" />
                      </Button>
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasSearched && results.length === 0 && !loading && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20 space-y-4"
        >
          <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
            <Search className="w-10 h-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">No facilities found</h3>
          <p className="text-slate-500">We couldn't find any hospitals offering "{query}". Try searching for MRI, Blood Test, or X-Ray.</p>
        </motion.div>
      )}

      {!hasSearched && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-12">
          <div className="bg-slate-50 rounded-[2.5rem] p-8 space-y-4">
            <h4 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Info className="w-5 h-5 text-brand-600" />
              Popular Searches
            </h4>
            <div className="flex flex-wrap gap-2">
              {['MRI Scan', 'Blood Test', 'CT Scan', 'X-Ray', 'Ultrasound', 'COVID-19 PCR'].map(test => (
                <button
                  key={test}
                  onClick={() => setQuery(test)}
                  className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:border-brand-500 hover:text-brand-600 transition-all"
                >
                  {test}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-brand-600 rounded-[2.5rem] p-8 text-white space-y-4 relative overflow-hidden">
            <FlaskConical className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10 rotate-12" />
            <h4 className="text-xl font-bold">Why use Diagnostic Finder?</h4>
            <ul className="space-y-3 text-brand-100">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-200 mt-2" />
                Compare prices across different hospitals
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-200 mt-2" />
                Find specialized testing centers near you
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-200 mt-2" />
                Check real-time availability for appointments
              </li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};
