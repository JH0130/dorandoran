import React from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';

const Controls = ({ isActive, toggleTimer, resetTimer, sessionType }) => {
  const isFocus = sessionType === 'Focus';
  const accentColor = isFocus ? 'bg-rose-500 hover:bg-rose-600' : 'bg-emerald-500 hover:bg-emerald-600';

  return (
    <div className="flex items-center gap-6">
      <motion.button
        whileHover={{ scale: 1.1, shadow: "0 0 20px rgba(251, 113, 133, 0.4)" }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleTimer}
        className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white shadow-xl transition-all ${
          isFocus 
          ? 'bg-gradient-to-br from-rose-400 to-rose-600 shadow-rose-500/20' 
          : 'bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/20'
        }`}
      >

        {isActive ? <Pause size={32} fill="currentColor" /> : <Play size={32} className="ml-1" fill="currentColor" />}
      </motion.button>

      <motion.button
        whileHover={{ scale: 1.1, rotate: -45 }}
        whileTap={{ scale: 0.9 }}
        onClick={resetTimer}
        className="w-16 h-16 rounded-2xl flex items-center justify-center bg-slate-800 text-slate-400 hover:text-white transition-colors border border-slate-700"
      >
        <RotateCcw size={24} />
      </motion.button>
    </div>
  );
};

export default Controls;
