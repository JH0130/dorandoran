import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const FocusChart = () => {
  const [stats, setStats] = useState({});
  const days = ['월', '화', '수', '목', '금', '토', '일'];

  const loadStats = () => {
    const data = JSON.parse(localStorage.getItem('kodari_stats') || '{}');
    setStats(data);
  };

  useEffect(() => {
    loadStats();
    window.addEventListener('statsUpdated', loadStats);
    return () => window.removeEventListener('statsUpdated', loadStats);
  }, []);

  const maxMinutes = Math.max(...Object.values(stats), 60); // Min scale of 60m

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full mt-12 bg-slate-900/50 backdrop-blur-md rounded-3xl p-6 border border-slate-800"
    >
      <h3 className="text-slate-200 font-bold mb-6 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
        주간 집중 기록 📊
      </h3>
      
      <div className="flex items-end justify-between gap-2 h-32">
        {days.map((day) => {
          const minutes = stats[day] || 0;
          const height = (minutes / maxMinutes) * 100;
          
          return (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <div className="relative w-full flex flex-col justify-end h-24">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${height}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-lg shadow-lg shadow-rose-500/10"
                />
                {minutes > 0 && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold text-rose-300">
                    {minutes}m
                  </span>
                )}
              </div>
              <span className="text-xs font-medium text-slate-500">{day}</span>
            </div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default FocusChart;
