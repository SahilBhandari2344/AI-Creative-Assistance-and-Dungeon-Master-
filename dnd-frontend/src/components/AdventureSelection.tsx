'use client';

import { useState, useEffect } from 'react';
import { Adventure, ADVENTURES } from '../types/adventure';
import { motion, AnimatePresence } from 'framer-motion';
import AdventureEditor from './AdventureEditor';

interface AdventureSelectionProps {
  onSelect: (adventure: Adventure) => void;
}

export default function AdventureSelection({ onSelect }: AdventureSelectionProps) {
  const [showEditor, setShowEditor] = useState(false);
  const [customAdventures, setCustomAdventures] = useState<Adventure[]>([]);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importCode, setImportCode] = useState('');
  
  // Load custom adventures from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('customAdventures');
    if (saved) {
      setCustomAdventures(JSON.parse(saved));
    }
  }, []);

  const handleSaveAdventure = (adventure: Adventure) => {
    const updated = [...customAdventures, adventure];
    setCustomAdventures(updated);
    localStorage.setItem('customAdventures', JSON.stringify(updated));
    setShowEditor(false);
  };

  const handleDeleteCustomAdventure = (id: string) => {
    if (confirm('Are you sure you want to delete this custom adventure?')) {
      const updated = customAdventures.filter(a => a.id !== id);
      setCustomAdventures(updated);
      localStorage.setItem('customAdventures', JSON.stringify(updated));
    }
  };

  const handleImportAdventure = () => {
    const adventure = customAdventures.find(a => a.code === importCode.trim().toUpperCase());
    if (adventure) {
      alert('Adventure found! Click on it to start playing.');
      setShowImportModal(false);
      setImportCode('');
    } else {
      alert('Invalid adventure code. Please check and try again.');
    }
  };

  const allAdventures = [...ADVENTURES, ...customAdventures];

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background Image - D&D Table */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('/table-background2.jpg')`,
          filter: 'brightness(0.4)',
        }}
      />

      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Vignette effect */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_rgba(0,0,0,0.8)_100%)]" />
      
      <div className="relative max-w-7xl mx-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-6xl font-serif font-bold text-amber-100 mb-4 drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
            Choose Your Quest
          </h1>
          <p className="text-amber-200 font-serif italic text-xl mb-6 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            Select an adventure from the quest board
          </p>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4">
            <button
              onClick={() => setShowEditor(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-serif font-bold px-6 py-3 rounded-lg border-2 border-purple-800 transition shadow-2xl hover:shadow-purple-500/50 hover:scale-105"
            >
              ✨ Create Custom Adventure
            </button>
            <button
              onClick={() => setShowImportModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white font-serif font-bold px-6 py-3 rounded-lg border-2 border-blue-800 transition shadow-2xl hover:shadow-blue-500/50 hover:scale-105"
            >
              🔗 Import Adventure Code
            </button>
          </div>
        </motion.div>

        {/* Custom Adventures Section */}
        {customAdventures.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mb-12"
          >
            <h2 className="text-4xl font-serif font-bold text-purple-300 mb-6 text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
              ✨ Your Custom Adventures
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {customAdventures.map((adventure, idx) => (
                <motion.div
                  key={adventure.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="group relative"
                >
                  {/* CHANGED: Replaced button with div and made card clickable */}
                  <div
                    onClick={() => onSelect(adventure)}
                    className="cursor-pointer w-full text-left"
                  >
                    {/* Card - SOLID BACKGROUND */}
                    <div 
                      className="rounded-lg border-4 border-purple-600 p-6 shadow-2xl hover:shadow-purple-500/50 transition-all relative overflow-hidden h-full hover:scale-105 duration-300"
                      style={{ 
                        backgroundImage: `
                          linear-gradient(135deg, rgba(243, 232, 255, 0.98) 0%, rgba(251, 207, 232, 0.98) 100%),
                          url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
                        `,
                        backgroundColor: 'rgba(243, 232, 255, 0.98)',
                      }}>
                      
                      {/* Custom Badge */}
                      <div className="absolute top-3 right-3 bg-purple-700 text-white text-xs px-3 py-1.5 rounded-full font-serif font-bold shadow-lg border-2 border-purple-900">
                        CUSTOM
                      </div>

                      {/* Delete Button - NOW PROPERLY POSITIONED */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCustomAdventure(adventure.id);
                        }}
                        className="absolute top-3 left-3 bg-red-600 hover:bg-red-700 text-white w-7 h-7 rounded-full flex items-center justify-center text-lg font-bold transition z-10 shadow-lg border-2 border-red-900"
                      >
                        ×
                      </button>
                      
                      {/* Content */}
                      <div className="relative mt-8">
                        {/* Title */}
                        <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-purple-900 transition-colors">
                          {adventure.title}
                        </h2>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`text-xs px-2 py-1 rounded font-serif font-semibold border-2 ${
                            adventure.difficulty === 'Beginner' 
                              ? 'bg-green-100 text-green-900 border-green-400' :
                            adventure.difficulty === 'Intermediate' 
                              ? 'bg-yellow-100 text-yellow-900 border-yellow-400' :
                              'bg-red-100 text-red-900 border-red-400'
                          }`}>
                            {adventure.difficulty}
                          </span>
                          <span className="text-xs px-2 py-1 rounded font-serif bg-blue-100 text-blue-900 border-2 border-blue-400 font-semibold">
                            {adventure.estimatedTime}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-gray-800 text-sm font-serif leading-relaxed mb-4 min-h-[4rem] font-medium">
                          {adventure.description}
                        </p>

                        {/* Share Code */}
                        {adventure.code && (
                          <div className="border-t-2 border-purple-400 pt-3 mb-3">
                            <div className="text-xs font-serif text-gray-700 mb-1 font-bold">Share Code:</div>
                            <div className="font-mono text-sm text-purple-900 font-bold bg-white px-3 py-1.5 rounded border-2 border-purple-400 shadow-inner">
                              {adventure.code}
                            </div>
                          </div>
                        )}

                        {/* Quest tags */}
                        <div className="border-t-2 border-purple-400 pt-3">
                          <div className="flex flex-wrap gap-2">
                            {adventure.tags.map((tag) => (
                              <span
                                key={tag}
                                className="text-xs px-2 py-1 bg-purple-200 text-purple-900 rounded font-serif border-2 border-purple-400 font-semibold"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>

                        {/* Stats */}
                        {(adventure.encounters || adventure.npcs) && (
                          <div className="flex gap-3 mt-3 text-xs font-serif text-gray-800 font-bold">
                            {adventure.npcs && adventure.npcs.length > 0 && (
                              <div className="bg-green-200 px-2 py-1 rounded border border-green-400">
                                👥 {adventure.npcs.length} NPCs
                              </div>
                            )}
                            {adventure.encounters && adventure.encounters.length > 0 && (
                              <div className="bg-red-200 px-2 py-1 rounded border border-red-400">
                                ⚔️ {adventure.encounters.length} Encounters
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Sparkle decoration */}
                      <div className="absolute -bottom-2 -right-2 text-4xl opacity-30 pointer-events-none">
                        ✨
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Base Adventures Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mb-12"
        >
          <h2 className="text-4xl font-serif font-bold text-amber-300 mb-6 text-center drop-shadow-[0_4px_8px_rgba(0,0,0,0.9)]">
            📜 Classic Adventures
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ADVENTURES.map((adventure, idx) => (
              <motion.button
                key={adventure.id}
                onClick={() => onSelect(adventure)}
                initial={{ opacity: 0, y: 30, rotateX: -10 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ delay: idx * 0.1, duration: 0.4 }}
                whileHover={{ y: -8, scale: 1.05, transition: { duration: 0.2 } }}
                className="group text-left"
              >
                {/* Card - SOLID BACKGROUND */}
                <div 
                  className="rounded-lg border-4 border-amber-700 p-6 shadow-2xl hover:shadow-amber-500/50 transition-all relative overflow-hidden h-full"
                  style={{ 
                    backgroundImage: `
                      linear-gradient(135deg, rgba(255, 251, 235, 0.98) 0%, rgba(254, 243, 199, 0.98) 100%),
                      url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")
                    `,
                    backgroundColor: 'rgba(255, 251, 235, 0.98)',
                  }}>
                  
                  {/* Slight crease effect */}
                  <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200 to-transparent opacity-50 pointer-events-none" />
                  
                  {/* Content */}
                  <div className="relative">
                    {/* Title */}
                    <h2 className="text-2xl font-serif font-bold text-gray-900 mb-3 group-hover:text-amber-900 transition-colors">
                      {adventure.title}
                    </h2>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded font-serif font-semibold border-2 ${
                        adventure.difficulty === 'Beginner' 
                          ? 'bg-green-100 text-green-900 border-green-400' :
                        adventure.difficulty === 'Intermediate' 
                          ? 'bg-yellow-100 text-yellow-900 border-yellow-400' :
                          'bg-red-100 text-red-900 border-red-400'
                      }`}>
                        {adventure.difficulty}
                      </span>
                      <span className="text-xs px-2 py-1 rounded font-serif bg-blue-100 text-blue-900 border-2 border-blue-400 font-semibold">
                        {adventure.estimatedTime}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="text-gray-800 text-sm font-serif leading-relaxed mb-4 min-h-[4rem] font-medium">
                      {adventure.description}
                    </p>

                    {/* Quest tags */}
                    <div className="border-t-2 border-amber-700 pt-3">
                      <div className="flex flex-wrap gap-2">
                        {adventure.tags.map((tag) => (
                          <span
                            key={tag}
                            className="text-xs px-2 py-1 bg-amber-200 text-amber-900 rounded font-serif border-2 border-amber-600 font-semibold"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Wax seal decoration */}
                    <div className="absolute -bottom-3 -right-3 w-14 h-14 bg-red-700 rounded-full opacity-30 group-hover:opacity-40 transition-opacity border-2 border-red-900" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Decorative elements - dice on table */}
        <div className="flex justify-center gap-8 mt-12 opacity-40">
          <div className="text-6xl transform rotate-12 drop-shadow-2xl">🎲</div>
          <div className="text-5xl transform -rotate-6 drop-shadow-2xl">📜</div>
          <div className="text-6xl transform rotate-6 drop-shadow-2xl">⚔️</div>
        </div>
      </div>

      {/* Adventure Editor Modal */}
      {showEditor && (
        <AdventureEditor
          onSave={handleSaveAdventure}
          onClose={() => setShowEditor(false)}
        />
      )}

      {/* Import Modal */}
      <AnimatePresence>
        {showImportModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setShowImportModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-amber-50 rounded-lg border-4 border-blue-600 p-8 max-w-md w-full shadow-2xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
              }}
            >
              <h3 className="text-2xl font-serif font-bold text-stone-900 mb-4">
                Import Adventure
              </h3>
              <p className="text-sm font-serif text-stone-700 mb-4 font-medium">
                Enter the adventure code shared by another player:
              </p>
              <input
                type="text"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                placeholder="ADV-XXXXX"
                className="w-full bg-white border-2 border-blue-400 rounded px-4 py-3 font-mono text-blue-800 font-bold uppercase focus:outline-none focus:border-blue-600 mb-4 shadow-inner"
              />
              <div className="flex gap-3">
                <button
                  onClick={() => setShowImportModal(false)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-3 px-6 rounded border-2 border-stone-500 transition shadow-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImportAdventure}
                  disabled={!importCode.trim()}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 text-white font-serif font-bold py-3 px-6 rounded border-2 border-blue-800 transition shadow-lg disabled:cursor-not-allowed"
                >
                  Import
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
