import React from 'react';
import { motion } from 'framer-motion';

const KodariHeader = ({ sessionType }) => {
  return (
    <div className="flex flex-col items-center mb-12">
      <motion.img
        src="https://raw.githubusercontent.com/wonseokjung/solopreneur-ai-agents/main/agents/kodari/assets/kodari_salute.png"
        alt="Kodari Manager"
        className="w-32 h-32 mb-4 animate-float"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      />
      <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-rose-400 to-rose-600 bg-clip-text text-transparent">
        KODARI POMODORO
      </h1>

      <p className="text-slate-400 font-medium">
        {sessionType === 'Focus' 
          ? "대표님, 지금은 집중할 시간입니다! 충성! 🫡" 
          : "대표님, 고생하셨습니다! 잠깐 쉬고 오시죠! ☕"}
      </p>
    </div>
  );
};

export default KodariHeader;
