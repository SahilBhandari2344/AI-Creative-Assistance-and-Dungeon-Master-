'use client';

import { useState } from 'react';
import { Character } from '../types/campaign';
import { motion, AnimatePresence } from 'framer-motion';

const CLASSES = ['Warrior', 'Mage', 'Rogue', 'Cleric', 'Ranger', 'Paladin', 'Bard', 'Barbarian'];
const RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Orc', 'Tiefling', 'Dragonborn', 'Gnome'];

interface CharacterCreatorProps {
  onComplete: (character: Character) => void;
  onBack: () => void;
}

interface Companion {
  name: string;
  type: string;
  background: string;
}

export default function CharacterCreator({ onComplete, onBack }: CharacterCreatorProps) {
  const [name, setName] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  const [race, setRace] = useState('');
  const [background, setBackground] = useState('');
  const [level, setLevel] = useState(1);
  const [companions, setCompanions] = useState<Companion[]>([]);
  
  // AI Generation states
  const [generatingBackground, setGeneratingBackground] = useState(false);
  const [generatedBackground, setGeneratedBackground] = useState('');
  const [showBackgroundApproval, setShowBackgroundApproval] = useState(false);
  
  // Companion states
  const [newCompanionName, setNewCompanionName] = useState('');
  const [newCompanionType, setNewCompanionType] = useState('');
  const [generatingCompanionBg, setGeneratingCompanionBg] = useState(false);
  const [generatedCompanionBg, setGeneratedCompanionBg] = useState('');
  const [showCompanionApproval, setShowCompanionApproval] = useState(false);

  const generateBackground = async () => {
    if (!name || !characterClass || !race) {
      alert('Please fill in name, class, and race first!');
      return;
    }

    setGeneratingBackground(true);
    try {
      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: name,
          characterClass,
          characterRace: race,
          type: 'character'
        })
      });

      const data = await response.json();
      if (data.background) {
        setGeneratedBackground(data.background);
        setShowBackgroundApproval(true);
      }
    } catch (error) {
      console.error('Error generating background:', error);
      alert('Failed to generate background. Please try again.');
    } finally {
      setGeneratingBackground(false);
    }
  };

  const approveBackground = () => {
    setBackground(generatedBackground);
    setShowBackgroundApproval(false);
    setGeneratedBackground('');
  };

  const retryBackground = () => {
    setShowBackgroundApproval(false);
    generateBackground();
  };

  const generateCompanionBackground = async () => {
    if (!newCompanionName || !newCompanionType) {
      alert('Please fill in companion name and type first!');
      return;
    }

    setGeneratingCompanionBg(true);
    try {
      const response = await fetch('/api/generate-background', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          characterName: newCompanionName,
          characterClass: newCompanionType,
          characterRace: '',
          type: 'companion'
        })
      });

      const data = await response.json();
      if (data.background) {
        setGeneratedCompanionBg(data.background);
        setShowCompanionApproval(true);
      }
    } catch (error) {
      console.error('Error generating companion background:', error);
      alert('Failed to generate companion background. Please try again.');
    } finally {
      setGeneratingCompanionBg(false);
    }
  };

  const approveCompanionBackground = () => {
    addCompanion(generatedCompanionBg);
    setShowCompanionApproval(false);
    setGeneratedCompanionBg('');
  };

  const retryCompanionBackground = () => {
    setShowCompanionApproval(false);
    generateCompanionBackground();
  };

  const addCompanion = (companionBg: string = '') => {
    if (newCompanionName && newCompanionType) {
      setCompanions([...companions, {
        name: newCompanionName,
        type: newCompanionType,
        background: companionBg
      }]);
      setNewCompanionName('');
      setNewCompanionType('');
      setGeneratedCompanionBg('');
    }
  };

  const removeCompanion = (index: number) => {
    setCompanions(companions.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!name || !characterClass || !race) {
      alert('Please fill in all required fields!');
      return;
    }

    const character: Character = {
      name,
      class: characterClass,
      race,
      level,
      background: background || 'A mysterious adventurer seeking fortune and glory.',
      companions: companions.map(c => `${c.name} (${c.type})${c.background ? ': ' + c.background : ''}`),
    };

    onComplete(character);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-900 via-amber-950 to-stone-950 p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-5xl font-serif font-bold text-amber-100 mb-3">
            Create Your Hero
          </h1>
          <p className="text-stone-400 font-serif italic text-lg">
            Define your character's identity
          </p>
        </motion.div>

        {/* Character Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-amber-50 rounded-lg border-4 border-amber-900/30 p-8 shadow-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        >
          <div className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                Character Name *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Aragorn, Gandalf, Legolas..."
                className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
              />
            </div>

            {/* Class & Race */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                  Class *
                </label>
                <select
                  value={characterClass}
                  onChange={(e) => setCharacterClass(e.target.value)}
                  className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
                >
                  <option value="">Select Class</option>
                  {CLASSES.map((cls) => (
                    <option key={cls} value={cls}>{cls}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                  Race *
                </label>
                <select
                  value={race}
                  onChange={(e) => setRace(e.target.value)}
                  className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
                >
                  <option value="">Select Race</option>
                  {RACES.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                Starting Level
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={level}
                onChange={(e) => setLevel(parseInt(e.target.value))}
                className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
              />
            </div>

            {/* Background Section */}
            <div>
              <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                Character Background
              </label>
              
              <div className="flex gap-2 mb-2">
                <button
                  onClick={generateBackground}
                  disabled={generatingBackground || !name || !characterClass || !race}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-stone-400 text-white font-serif font-bold px-4 py-2 rounded border-2 border-purple-800 transition text-sm disabled:cursor-not-allowed"
                >
                  {generatingBackground ? '✨ Generating...' : '✨ AI Generate'}
                </button>
                <span className="text-xs font-serif text-stone-600 italic self-center">
                  or write your own below
                </span>
              </div>

              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Write your character's backstory... (or use AI Generate)"
                rows={4}
                className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700 resize-none"
              />
            </div>

            {/* Companions */}
            <div>
              <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                Companions (Optional)
              </label>
              
              {companions.length > 0 && (
                <div className="mb-3 space-y-2">
                  {companions.map((companion, idx) => (
                    <div key={idx} className="flex items-start justify-between bg-green-100 border-2 border-green-600 rounded p-3">
                      <div className="flex-1">
                        <div className="font-serif font-bold text-green-900">
                          {companion.name} ({companion.type})
                        </div>
                        {companion.background && (
                          <div className="text-sm font-serif text-green-800 mt-1">
                            {companion.background}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => removeCompanion(idx)}
                        className="text-red-600 hover:text-red-800 font-bold text-xl ml-2"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="bg-blue-100 border-2 border-blue-600 rounded p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newCompanionName}
                    onChange={(e) => setNewCompanionName(e.target.value)}
                    placeholder="Companion name"
                    className="bg-white border-2 border-blue-300 rounded px-3 py-2 font-serif text-sm"
                  />
                  <input
                    type="text"
                    value={newCompanionType}
                    onChange={(e) => setNewCompanionType(e.target.value)}
                    placeholder="Type (Wolf, Hawk, etc.)"
                    className="bg-white border-2 border-blue-300 rounded px-3 py-2 font-serif text-sm"
                  />
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={generateCompanionBackground}
                    disabled={generatingCompanionBg || !newCompanionName || !newCompanionType}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 disabled:bg-stone-400 text-white font-serif font-bold py-2 rounded text-sm transition disabled:cursor-not-allowed"
                  >
                    {generatingCompanionBg ? '✨ Generating...' : '✨ AI Generate Background'}
                  </button>
                  <button
                    onClick={() => addCompanion('')}
                    disabled={!newCompanionName || !newCompanionType}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 text-white font-serif font-bold px-4 py-2 rounded text-sm transition disabled:cursor-not-allowed"
                  >
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={onBack}
              className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={!name || !characterClass || !race}
              className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
            >
              Create Character →
            </button>
          </div>
        </motion.div>
      </div>

      {/* Character Background Approval Modal */}
      <AnimatePresence>
        {showBackgroundApproval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-amber-50 rounded-lg border-4 border-purple-600 p-8 max-w-2xl w-full shadow-2xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
              }}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">✨</div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                  Generated Background
                </h3>
                <p className="text-sm font-serif text-stone-600 italic">
                  Review and approve or try again
                </p>
              </div>

              <div className="bg-white border-2 border-purple-400 rounded-lg p-6 mb-6">
                <p className="font-serif text-stone-800 leading-relaxed text-lg">
                  {generatedBackground}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={retryBackground}
                  disabled={generatingBackground}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-400 text-white font-serif font-bold py-3 px-6 rounded border-2 border-amber-800 transition"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={approveBackground}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-serif font-bold py-3 px-6 rounded border-2 border-green-800 transition"
                >
                  ✓ Approve & Use
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Companion Background Approval Modal */}
      <AnimatePresence>
        {showCompanionApproval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-amber-50 rounded-lg border-4 border-blue-600 p-8 max-w-2xl w-full shadow-2xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
              }}
            >
              <div className="text-center mb-4">
                <div className="text-4xl mb-2">🐾</div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                  Generated Companion Background
                </h3>
                <p className="text-sm font-serif text-stone-600 italic">
                  For {newCompanionName} the {newCompanionType}
                </p>
              </div>

              <div className="bg-white border-2 border-blue-400 rounded-lg p-6 mb-6">
                <p className="font-serif text-stone-800 leading-relaxed text-lg">
                  {generatedCompanionBg}
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={retryCompanionBackground}
                  disabled={generatingCompanionBg}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-400 text-white font-serif font-bold py-3 px-6 rounded border-2 border-amber-800 transition"
                >
                  🔄 Try Again
                </button>
                <button
                  onClick={approveCompanionBackground}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-serif font-bold py-3 px-6 rounded border-2 border-green-800 transition"
                >
                  ✓ Approve & Add
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
