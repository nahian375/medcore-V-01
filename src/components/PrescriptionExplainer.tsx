import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { GoogleGenAI } from "@google/genai";
import { Button } from '../components/common/Button';
import { Pill, Send, Loader2, AlertCircle, Info, FileText, Upload, X, Image as ImageIcon, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export const PrescriptionExplainer: React.FC = () => {
  const [prescription, setPrescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [filePreview, setFilePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size too large. Please upload a file smaller than 5MB.');
        return;
      }
      setFile(selectedFile);
      setError(null);
      
      if (selectedFile.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setFilePreview(reader.result as string);
        };
        reader.readAsDataURL(selectedFile);
      } else {
        setFilePreview(null);
      }
    }
  };

  const removeFile = () => {
    setFile(null);
    setFilePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const fileToGenerativePart = async (file: File) => {
    const base64EncodedDataPromise = new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const explainPrescription = async () => {
    if (!prescription.trim() && !file) return;

    setLoading(true);
    setError(null);
    setResult('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const parts: any[] = [];
      
      let prompt = `Explain the following medication prescription details in simple, clear language for a patient.
      
      Please structure your response with:
      1. Medication Overview (What is it for?)
      2. Dosage & Administration (How and when to take it?)
      3. Common Side Effects
      4. Important Precautions (What to avoid?)
      5. When to contact a doctor
      
      IMPORTANT: Start your response with a clear medical disclaimer stating that this is an AI-powered tool and not a substitute for professional medical advice or the instructions provided by your doctor or pharmacist.`;

      if (prescription.trim()) {
        prompt += `\n\nPrescription Details Provided: ${prescription}`;
      }

      parts.push({ text: prompt });

      if (file) {
        const filePart = await fileToGenerativePart(file);
        parts.push(filePart);
      }

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: { parts },
        config: {
          temperature: 0.4,
        },
      });

      setResult(response.text || 'No explanation could be generated.');
    } catch (err: any) {
      console.error(err);
      if (err.status === 429 || err.message?.includes('429') || err.message?.includes('quota') || err.message?.includes('RESOURCE_EXHAUSTED')) {
        setError('The AI service is currently busy or has reached its limit. Please try again in a few minutes.');
      } else {
        setError('Failed to explain prescription. Please try again later.');
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
        className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden"
      >
        <div className="p-10 border-b border-slate-50 bg-gradient-to-br from-purple-50/50 to-transparent">
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-purple-500 rounded-2xl text-white shadow-lg shadow-purple-500/20">
              <Pill className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-slate-900">AI Prescription Explainer</h2>
              <p className="text-slate-500">Understand your medications in simple terms.</p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div className="relative group">
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                placeholder="Paste prescription details here... (e.g., Amoxicillin 500mg, 1 tablet 3 times a day)"
                className="w-full h-40 p-6 bg-slate-50/50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 outline-none transition-all resize-none text-lg placeholder:text-slate-400 group-hover:bg-white dark:group-hover:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex flex-wrap gap-4 items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*,application/pdf"
                className="hidden"
              />
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 rounded-2xl border-dashed border-2 border-orange-300 dark:border-orange-700 bg-orange-50 dark:bg-orange-900/20 px-6 py-4 hover:bg-orange-100 dark:hover:bg-orange-900/40 hover:border-orange-400 transition-all text-orange-700 dark:text-orange-300"
              >
                <Upload className="w-5 h-5" />
                <span className="font-semibold">Upload Image or PDF</span>
              </Button>

              <AnimatePresence>
                {file && (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex items-center gap-3 bg-purple-50 px-4 py-2 rounded-2xl border border-purple-100"
                  >
                    {filePreview ? (
                      <img src={filePreview} alt="Preview" className="w-8 h-8 rounded-lg object-cover shadow-sm" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-purple-600" />
                    )}
                    <span className="text-sm text-purple-700 font-bold truncate max-w-[200px]">
                      {file.name}
                    </span>
                    <button onClick={removeFile} className="p-1 hover:bg-purple-200 rounded-full transition-colors">
                      <X className="w-4 h-4 text-purple-600" />
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex justify-end">
              <Button 
                onClick={explainPrescription} 
                disabled={loading || (!prescription.trim() && !file)}
                className="flex items-center gap-2 rounded-2xl px-10 py-6 bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/20"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                <span className="text-lg font-semibold">{loading ? 'Analyzing...' : 'Explain Prescription'}</span>
              </Button>
            </div>
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

            {result ? (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8"
              >
                <div className="p-6 bg-blue-50/50 dark:bg-blue-900/20 border border-blue-100/50 dark:border-blue-800/50 text-blue-700 dark:text-blue-300 rounded-3xl flex items-start gap-4 text-sm leading-relaxed">
                  <Info className="w-6 h-6 mt-0.5 flex-shrink-0 text-blue-500 dark:text-blue-400" />
                  <p className="font-medium">This explanation is generated by AI for informational purposes. Always follow the specific instructions provided by your healthcare provider and pharmacist.</p>
                </div>
                <div className="prose prose-slate max-w-none bg-slate-50/30 dark:bg-slate-900/50 p-10 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-inner dark:prose-invert">
                  <div className="markdown-body">
                    <ReactMarkdown>{result}</ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ) : !loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 text-slate-400 dark:text-slate-500"
              >
                <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-12 h-12 opacity-20 dark:opacity-40" />
                </div>
                <p className="text-xl font-medium text-slate-600 dark:text-slate-400">Your explanation will appear here.</p>
                <p className="text-slate-400 dark:text-slate-500 mt-2">Upload or enter prescription details to get started.</p>
              </motion.div>
            )}

            {loading && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-20 text-slate-500 dark:text-slate-400"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-orange-500/20 dark:bg-orange-500/10 blur-3xl rounded-full animate-pulse"></div>
                  <Loader2 className="w-16 h-16 animate-spin text-orange-600 dark:text-orange-500 relative z-10" />
                </div>
                <p className="mt-8 text-xl font-bold text-slate-900 dark:text-white">Analyzing Prescription...</p>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-sm">Our AI is reading your prescription to provide a clear explanation.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};
