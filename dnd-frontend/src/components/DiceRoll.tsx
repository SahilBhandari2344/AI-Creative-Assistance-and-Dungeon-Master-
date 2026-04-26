'use client';

import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface DiceRollProps {
  value: number;
  type?: 'd20' | 'd12' | 'd10' | 'd8' | 'd6' | 'd4';
}

export default function DiceRoll({ value, type = 'd20' }: DiceRollProps) {
  const [isRolling, setIsRolling] = useState(true);
  const [displayValue, setDisplayValue] = useState(1);

  useEffect(() => {
    // Simulate rolling animation
    const rollInterval = setInterval(() => {
      setDisplayValue(Math.floor(Math.random() * 20) + 1);
    }, 50);

    // Stop after 1 second and show final value
    setTimeout(() => {
      clearInterval(rollInterval);
      setDisplayValue(value);
      setIsRolling(false);
    }, 1000);

    return () => clearInterval(rollInterval);
  }, [value]);

  const isCritical = type === 'd20' && value === 20;
  const isCriticalFail = type === 'd20' && value === 1;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -180 }}
      animate={{ 
        scale: isRolling ? [1, 1.2, 1] : 1,
        rotate: isRolling ? 360 : 0 
      }}
      transition={{ 
        duration: 0.5,
        repeat: isRolling ? Infinity : 0,
        ease: "easeInOut"
      }}
      className="inline-flex items-center gap-2 mx-1"
    >
      <div className={`relative inline-flex items-center justify-center w-12 h-12 rounded-lg border-2 font-bold text-lg shadow-lg transition-all ${
        isCritical 
          ? 'bg-gradient-to-br from-yellow-400 to-orange-500 border-yellow-600 text-white animate-pulse' 
          : isCriticalFail
          ? 'bg-gradient-to-br from-red-500 to-red-700 border-red-800 text-white'
          : 'bg-amber-50 border-amber-900/40 text-stone-900'
      }`}>
        <span className={isRolling ? 'blur-sm' : ''}>
          {displayValue}
        </span>
        {!isRolling && isCritical && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            ✨
          </motion.span>
        )}
        {!isRolling && isCriticalFail && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: [0, 1.5, 1] }}
            className="absolute -top-2 -right-2 text-2xl"
          >
            💀
          </motion.span>
        )}
      </div>
      <span className="text-xs font-serif text-amber-300 font-semibold">
        {type}
      </span>
    </motion.div>
  );
}
