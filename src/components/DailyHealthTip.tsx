import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Sparkles, X, Lightbulb } from 'lucide-react';

const healthTips = [
  "Wake up early.",
  "Go to bed on time.",
  "Drink water after waking up.",
  "Do morning stretching.",
  "Get sunlight for 15–30 minutes.",
  "Take a daily shower.",
  "Wear clean clothes.",
  "Keep your room clean.",
  "Maintain good posture.",
  "Take short breaks from work.",
  "Eat balanced food.",
  "Eat fruits daily.",
  "Eat vegetables daily.",
  "Don’t skip breakfast.",
  "Avoid junk food.",
  "Limit sugar intake.",
  "Eat home-cooked food.",
  "Eat slowly.",
  "Don’t overeat.",
  "Drink water before meals.",
  "Include protein foods.",
  "Eat fiber-rich foods.",
  "Eat nuts in moderation.",
  "Avoid too much fried food.",
  "Eat fresh food.",
  "Drink 2–3 liters water daily.",
  "Carry a water bottle.",
  "Drink water regularly.",
  "Avoid too much cold drinks.",
  "Drink warm water sometimes.",
  "Walk daily.",
  "Exercise 30 minutes.",
  "Do yoga or stretching.",
  "Move your body every hour.",
  "Maintain healthy weight.",
  "Climb stairs when possible.",
  "Play outdoor games.",
  "Do light workout.",
  "Keep body flexible.",
  "Avoid long sitting.",
  "Reduce stress.",
  "Stay positive.",
  "Practice deep breathing.",
  "Listen to music.",
  "Spend time with family.",
  "Talk with friends.",
  "Take rest when tired.",
  "Avoid overthinking.",
  "Laugh more.",
  "Follow hobbies.",
  "Reduce mobile usage.",
  "Follow 20-20-20 eye rule.",
  "Avoid phone before sleep.",
  "Maintain good lighting.",
  "Keep correct screen distance.",
  "Avoid smoking.",
  "Avoid alcohol.",
  "Avoid late night eating.",
  "Avoid excess coffee.",
  "Avoid stress eating.",
  "Brush teeth twice daily.",
  "Wash hands before eating.",
  "Cut nails regularly.",
  "Keep hair clean.",
  "Use clean towels.",
  "Sleep 7–9 hours.",
  "Do medical checkups.",
  "Protect skin from pollution.",
  "Wear comfortable shoes.",
  "Maintain body temperature.",
  "Drink herbal tea sometimes.",
  "Eat seasonal fruits.",
  "Practice gratitude.",
  "Learn new things.",
  "Stay socially connected.",
  "Help others.",
  "Keep positive mindset.",
  "Maintain work-life balance.",
  "Read books.",
  "Follow healthy diet.",
  "Do meditation.",
  "Avoid noise pollution.",
  "Keep good sitting position.",
  "Stay active.",
  "Maintain heart health.",
  "Don’t skip sleep.",
  "Eat on time.",
  "Stay hydrated.",
  "Exercise regularly.",
  "Reduce stress.",
  "Avoid fast lifestyle pressure.",
  "Protect eyesight.",
  "Stay hygienic.",
  "Eat natural food.",
  "Keep body active.",
  "Maintain mental peace.",
  "Follow routine.",
  "Love yourself.",
  "Be patient.",
  "Live healthy."
];

export const DailyHealthTip: React.FC = () => {
  const [tip, setTip] = useState('');
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Calculate day index based on epoch time (changes every 24 hours)
    // We use local time day to ensure it changes at midnight for the user
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    const tipIndex = dayOfYear % healthTips.length;
    setTip(healthTips[tipIndex]);
  }, []);

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8 relative overflow-hidden rounded-[2rem] bg-gradient-to-r from-violet-600 to-indigo-600 p-1 shadow-xl shadow-indigo-500/20"
    >
      <div className="relative bg-white rounded-[1.8rem] p-6 flex items-start md:items-center gap-5">
        <div className="p-3.5 bg-indigo-50 text-indigo-600 rounded-2xl shrink-0">
          <Lightbulb className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            <h4 className="text-xs font-black text-indigo-600 uppercase tracking-widest">Today's Health Tips</h4>
          </div>
          <p className="text-slate-900 font-bold text-lg leading-snug">{tip}</p>
        </div>
        <button 
          onClick={() => setIsVisible(false)}
          className="p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-xl transition-colors shrink-0"
        >
          <X className="w-5 h-5" />
        </button>
      </div>
    </motion.div>
  );
};
