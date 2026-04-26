'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface QuickActionsProps {
  onAction: (action: string) => void;
  disabled: boolean;
}

const QUICK_ACTIONS = [
  { id: 'investigate', label: 'Investigate', emoji: '🔍', action: 'I carefully investigate the area, looking for clues or anything unusual.' },
  { id: 'attack', label: 'Attack', emoji: '⚔️', action: 'I attack the nearest enemy with my weapon!' },
  { id: 'talk', label: 'Talk', emoji: '💬', action: 'I try to talk and negotiate with them.' },
  { id: 'defend', label: 'Defend', emoji: '🛡️', action: 'I take a defensive stance and prepare to protect myself and my allies.' },
  { id: 'cast', label: 'Cast Spell', emoji: '✨', action: 'I prepare to cast a spell.' },
  { id: 'hide', label: 'Hide', emoji: '👁️', action: 'I attempt to hide and stay out of sight.' },
];

export default function QuickActions({ onAction, disabled }: QuickActionsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="relative">
      {/* Toggle Button */}
      {!isExpanded ? (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setIsExpanded(true)}
          disabled={disabled}
          className="bg-amber-700 hover:bg-amber-800 disabled:bg-stone-600 text-amber-50 rounded-full w-14 h-14 flex items-center justify-center shadow-xl border-2 border-amber-900 transition disabled:cursor-not-allowed"
        >
          <span className="text-2xl">⚡</span>
        </motion.button>
      ) : (
        /* Expanded Actions Menu */
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-amber-50 rounded-lg p-4 shadow-2xl border-2 border-amber-900/30 w-64"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-900/20">
            <h4 className="text-sm font-serif font-bold text-stone-900 uppercase">Quick Actions</h4>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-stone-600 hover:text-stone-900 text-lg leading-none"
            >
              ×
            </button>
          </div>

          {/* Action Buttons Grid */}
          <div className="grid grid-cols-2 gap-2">
            {QUICK_ACTIONS.map((qa, idx) => (
              <motion.button
                key={qa.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  onAction(qa.action);
                  setIsExpanded(false);
                }}
                disabled={disabled}
                className="bg-white/50 hover:bg-amber-100 disabled:bg-stone-200 border border-amber-900/20 rounded-lg p-3 text-center transition disabled:cursor-not-allowed"
              >
                <div className="text-2xl mb-1">{qa.emoji}</div>
                <div className="text-xs font-serif font-semibold text-stone-900">
                  {qa.label}
                </div>
              </motion.button>
            ))}
          </div>

          {/* Helper text */}
          <p className="text-[10px] font-serif text-stone-500 italic text-center mt-3">
            Click an action to use it
          </p>
        </motion.div>
      )}
    </div>
  );
}
