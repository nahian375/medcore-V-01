import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/common/Button';
import { Stethoscope, Send, Loader2, AlertCircle, Info, Sparkles, Plus } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { addNotification } from '../utils/notifications';

const COMMON_SYMPTOMS = [
  "Headache", "Fever", "Cough", "Fatigue", "Nausea", 
  "Sore Throat", "Body Ache", "Dizziness", "Shortness of breath"
];

export const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  const handleAddSymptom = (symptom: string) => {
    setSymptoms(prev => {
      const current = prev.trim();
      if (!current) return symptom;
      if (current.toLowerCase().includes(symptom.toLowerCase())) return current;
      return `${current}, ${symptom}`;
    });
  };

  const analyzeSymptoms = async () => {
    if (!symptoms.trim()) {
      console.warn('No symptoms to analyze');
      return;
    }

    setLoading(true);
    setError(null);
    setResult('');
    
    console.log('Analyzing symptoms:', symptoms);

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error('Gemini API key is not configured in the environment.');
      }
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are a professional medical assistant AI. Analyze the following symptoms and provide potential health insights. 
        
        CONTENTS:
        - The input might be from voice recognition (possibly containing phonetic errors) or manual typing.
        - It may be in English, Bengali, or a mix (Benglish).
        
        USER INPUT: "${symptoms.trim()}"
        
        RESPONSE REQUIREMENTS:
        1. Start with a clear MEDICAL DISCLAIMER.
        2. Provide a list of POTENTIAL CONDITIONS.
        3. Suggest RECOMMENDED NEXT STEPS.
        4. List EMERGENCY RED FLAGS (When to seek immediate care).
        
        LANGUAGE:
        - Respond in the same language as the user's input (English or Bengali).
        - Use professional yet accessible language.`,
        config: {
          temperature: 0.3, // Even lower for medical consistency
          topP: 0.8,
        },
      });

      if (!response.text) {
        throw new Error('The AI was unable to generate a response. Please try again.');
      }

      setResult(response.text);
      
      try {
        addNotification({
          topic: 'healthTips',
          title: 'Analysis Ready',
          message: 'Your symptom analysis has been generated successfully.',
          iconType: 'health',
          color: 'bg-emerald-100 text-emerald-600'
        });
      } catch (nErr) {
        console.warn('Notification failed:', nErr);
      }
    } catch (err: any) {
      console.error('Symptom Analysis Error:', err);
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
      } else {
        setError(err.message || 'An unexpected error occurred. Please try again.');
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
        <div className="p-10 border-b border-slate-50 dark:border-slate-800 bg-gradient-to-br from-emerald-50/50 dark:from-emerald-900/20 to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-emerald-500 rounded-2xl text-white shadow-lg shadow-emerald-500/20">
              <Stethoscope className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">AI Symptom Checker</h2>
              <p className="text-slate-500">Get instant insights into your health concerns.</p>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-slate-700 mb-3">Quick Symptoms</label>
            <div className="flex flex-wrap gap-2">
              {COMMON_SYMPTOMS.map(sym => (
                <button
                  key={sym}
                  onClick={() => handleAddSymptom(sym)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 border border-slate-200 hover:border-emerald-200 rounded-full text-sm font-medium transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {sym}
                </button>
              ))}
            </div>
          </div>

          <div className="relative group">
            <label className="block text-sm font-medium text-slate-700 mb-2">Describe your symptoms</label>
            <textarea
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="e.g., I have a persistent dry cough and mild fever..."
              className="w-full h-40 p-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 outline-none transition-all resize-none text-lg placeholder:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          
          <div className="flex flex-wrap items-center justify-between gap-4 mt-6">
            <div className="flex items-center gap-2">
              {symptoms && (
                <button 
                  onClick={() => setSymptoms('')}
                  className="p-4 text-slate-400 hover:text-red-500 transition-colors"
                  title="Clear text"
                >
                  <AlertCircle className="w-5 h-5 rotate-45" />
                </button>
              )}
            </div>

            <Button 
              onClick={analyzeSymptoms} 
              disabled={loading || !symptoms.trim()}
              className="flex items-center gap-2 rounded-2xl px-8 py-4 bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-500/20"
            >
              {loading ? <Loader2 className="w-6 h-6 animate-spin" /> : <Sparkles className="w-6 h-6" />}
              <span className="text-lg font-semibold">{loading ? 'Analyzing...' : 'Analyze Symptoms'}</span>
            </Button>
          </div>
        </div>

        <div className="p-10">
          <AnimatePresence mode="wait">
            {error && (
              <motion.div 
                key="error"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="p-6 bg-red-50 border border-red-100 text-red-600 rounded-3xl mb-8 flex items-start gap-4"
              >
                <AlertCircle className="w-6 h-6 mt-0.5 flex-shrink-0" />
                <p className="font-medium">{error}</p>
              </motion.div>
            )}

            {result && !loading && !error ? (
              <motion.div 
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8"
              >
                <div className="p-6 bg-blue-50/50 border border-blue-100/50 text-blue-700 rounded-3xl flex items-start gap-4 text-sm leading-relaxed">
                  <Info className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-500" />
                  <p className="font-medium">This analysis is generated by AI for informational purposes. Always consult with a healthcare professional for diagnosis and treatment.</p>
                </div>
                <div className="prose prose-slate max-w-none bg-slate-50/30 p-10 rounded-[2.5rem] border border-slate-100 shadow-inner dark:prose-invert dark:bg-slate-900/50 dark:border-slate-800">
                  <div className="markdown-body">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ) : !loading && !error && !result ? (
              <motion.div 
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-20 text-slate-400"
              >
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Stethoscope className="w-12 h-12 opacity-20" />
                </div>
                <p className="text-xl font-medium">Your analysis will appear here.</p>
                <p className="text-slate-400 mt-2">Describe your symptoms above to get started.</p>
              </motion.div>
            ) : null}

            {loading && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-20 text-slate-500"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500/20 blur-3xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 animate-spin text-emerald-600 relative z-10" />
                </div>
                <p className="mt-8 text-xl font-bold text-slate-900">Consulting MedCore AI...</p>
                <p className="text-slate-500 mt-2">We're analyzing your symptoms for potential insights.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
