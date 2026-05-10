import { useState, useEffect, useRef } from 'react';

export const useTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionType, setSessionType] = useState('Focus'); // 'Focus' or 'Break'
  const intervalRef = useRef(null);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      clearInterval(intervalRef.current);
      handleSessionEnd();
    } else {
      clearInterval(intervalRef.current);
    }

    return () => clearInterval(intervalRef.current);
  }, [isActive, timeLeft]);

  const handleSessionEnd = () => {
    if (sessionType === 'Focus') {
      saveFocusTime();
      setSessionType('Break');
      setTimeLeft(5 * 60);
    } else {
      setSessionType('Focus');
      setTimeLeft(25 * 60);
    }
    setIsActive(false);
  };

  const saveFocusTime = () => {
    const today = new Date().toLocaleDateString('ko-KR', { weekday: 'short' }); // 월, 화, 수...
    const stats = JSON.parse(localStorage.getItem('kodari_stats') || '{}');
    stats[today] = (stats[today] || 0) + 25; // Add 25 minutes
    localStorage.setItem('kodari_stats', JSON.stringify(stats));
    window.dispatchEvent(new Event('statsUpdated'));
  };


  const toggleTimer = () => setIsActive(!isActive);
  
  const resetTimer = () => {
    setIsActive(false);
    setSessionType('Focus');
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return {
    timeLeft,
    isActive,
    sessionType,
    toggleTimer,
    resetTimer,
    formatTime,
    progress: (timeLeft / (sessionType === 'Focus' ? 25 * 60 : 5 * 60)) * 100,
  };
};
