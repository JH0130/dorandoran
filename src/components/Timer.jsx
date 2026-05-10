import React from 'react';
import { motion } from 'framer-motion';

const Timer = ({ timeLeft, formatTime, sessionType, progress }) => {
  const isFocus = sessionType === 'Focus';
  const color = isFocus ? '#fb7185' : '#34d399'; // rose-400 or emerald-400

  return (
    <div className="relative flex items-center justify-center mb-12">
      {/* Progress Ring */}
      <svg className="w-80 h-80 transform -rotate-90">
        <defs>
          <linearGradient id="focusGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb7185" />
            <stop offset="100%" stopColor="#f43f5e" />
          </linearGradient>
          <linearGradient id="breakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
        <circle
          cx="160"
          cy="160"
          r="150"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-slate-800/50"
        />
        <motion.circle
          cx="160"
          cy="160"
          r="150"
          stroke={`url(#${isFocus ? 'focusGradient' : 'breakGradient'})`}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray="942"
          initial={{ strokeDashoffset: 0 }}
          animate={{ strokeDashoffset: 942 - (942 * progress) / 100 }}
          transition={{ duration: 1, ease: "linear" }}
          strokeLinecap="round"
          style={{ filter: `drop-shadow(0 0 8px ${isFocus ? '#fb7185' : '#34d399'}44)` }}
        />
      </svg>


      {/* Timer Text */}
      <div className="absolute flex flex-col items-center">
        <motion.span 
          key={timeLeft}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-7xl font-extrabold tracking-tighter text-white tabular-nums"
        >
          {formatTime(timeLeft)}
        </motion.span>
        <span 
          className={`text-xl font-bold uppercase tracking-widest mt-2 ${
            isFocus ? 'text-rose-400' : 'text-emerald-400'
          }`}
        >
          {sessionType}
        </span>
      </div>
    </div>
  );
};

export default Timer;
