'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

interface Message {
  role: 'user' | 'dm' | 'companion';
  content: string;
  companionName?: string;
}

interface TabletopChatProps {
  messages: Message[];
  playerName: string;
  loading: boolean;
  streamingText?: string;
}

// Companion avatars/emojis
const COMPANION_INFO: Record<string, { emoji: string; color: string }> = {
  Thorin: { emoji: '⚔️', color: 'bg-orange-100 border-orange-600 text-orange-900' },
  Elena: { emoji: '✨', color: 'bg-purple-100 border-purple-600 text-purple-900' },
  Finn: { emoji: '🗡️', color: 'bg-green-100 border-green-600 text-green-900' },
};

export default function TabletopChat({ messages, playerName, loading, streamingText }: TabletopChatProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div 
      className="h-full flex flex-col relative"
      style={{
        backgroundImage: `url('/table-background.jpg')`, // Replace with your actual filename
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Dark overlay for readability */}
      <div className="absolute inset-0 bg-black/40 pointer-events-none" />

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10">
        {messages.map((message, idx) => {
          // DM narration → left. User action → right. Companion → center-left with distinct style.
          let justifyClass = 'justify-start';
          if (message.role === 'user') justifyClass = 'justify-end';
          if (message.role === 'companion') justifyClass = 'justify-start';

          return (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${justifyClass}`}
            >
              {/* DM Message - LEFT */}
              {message.role === 'dm' && (
                <div className="max-w-3xl">
                  <div className="bg-stone-800/90 text-stone-100 rounded-lg px-5 py-4 border-2 border-stone-700 shadow-xl backdrop-blur-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xl">🎲</span>
                      <span className="text-xs font-serif font-bold text-amber-400">
                        Dungeon Master
                      </span>
                    </div>
                    <div className="font-serif text-base leading-relaxed italic">
                      {message.content}
                    </div>
                  </div>
                </div>
              )}

              {/* User Message - RIGHT */}
              {message.role === 'user' && (
                <div className="max-w-2xl">
                  <div className="bg-amber-700/95 text-amber-50 rounded-lg px-5 py-3 border-2 border-amber-900 shadow-lg backdrop-blur-sm">
                    <div className="text-xs font-serif font-bold mb-1 opacity-75 text-right">
                      {playerName}
                    </div>
                    <div className="font-serif text-base leading-relaxed">
                      {message.content}
                    </div>
                  </div>
                </div>
              )}

              {/* Companion Message - LEFT, offset with ml-8 to distinguish from DM */}
              {message.role === 'companion' && message.companionName && (
                <div className="max-w-2xl ml-8">
                  <div
                    className={`rounded-lg px-5 py-3 border-2 shadow-lg backdrop-blur-sm ${
                      COMPANION_INFO[message.companionName]?.color ||
                      'bg-blue-100 border-blue-600 text-blue-900'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">
                        {COMPANION_INFO[message.companionName]?.emoji || '🎭'}
                      </span>
                      <span className="text-xs font-serif font-bold">
                        {message.companionName}
                      </span>
                    </div>
                    <div className="font-serif text-base leading-relaxed">
                      &ldquo;{message.content}&rdquo;
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}

        {/* Streaming / Loading Indicator */}
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="max-w-3xl bg-stone-800/90 text-stone-100 rounded-lg px-5 py-4 border-2 border-stone-700 backdrop-blur-sm shadow-xl">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">🎲</span>
                <span className="text-xs font-serif font-bold text-amber-400">Dungeon Master</span>
                {!streamingText && (
                  <motion.span
                    animate={{ opacity: [1, 0.3, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    className="text-xs text-stone-400 italic ml-1"
                  >
                    thinking...
                  </motion.span>
                )}
              </div>
              {streamingText ? (
                <div className="font-serif text-base leading-relaxed italic">
                  {streamingText}
                  <motion.span
                    animate={{ opacity: [1, 0] }}
                    transition={{ repeat: Infinity, duration: 0.5 }}
                    className="inline-block w-1 h-4 bg-amber-400 ml-1 align-middle"
                  />
                </div>
              ) : (
                <div className="flex gap-1">
                  {[0, 0.2, 0.4].map((delay, i) => (
                    <motion.span
                      key={i}
                      animate={{ scale: [1, 1.3, 1] }}
                      transition={{ repeat: Infinity, duration: 1, delay }}
                      className="text-xl"
                    >
                      🎲
                    </motion.span>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
