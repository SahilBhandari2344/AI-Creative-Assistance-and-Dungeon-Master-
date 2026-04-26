'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef } from 'react';
import { SaveGame } from '../types/saveGame';
import { 
  getAllSaves, 
  saveGame, 
  loadGame, 
  deleteSave, 
  exportSave, 
  importSave,
  formatSaveDate,
  formatPlayTime,
  getNextAvailableSlot
} from '../lib/saveSystem';

const isBrowser = typeof window !== 'undefined';

interface SaveLoadMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onLoad: (saveGame: SaveGame) => void;
  currentGame?: {
    character: any;
    adventure: any;
    messages: any[];
    playTime: number;
  };
}

export default function SaveLoadMenu({ isOpen, onClose, onLoad, currentGame }: SaveLoadMenuProps) {
  const [saves, setSaves] = useState<SaveGame[]>(isBrowser ? getAllSaves() : []);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const refreshSaves = () => {
    if (isBrowser) {
      setSaves(getAllSaves());
    }
  };

  const handleSave = () => {
    if (!currentGame || !isBrowser) return;
    
    const slot = selectedSlot >= 0 ? selectedSlot : getNextAvailableSlot();
    
    if (slot < 0) {
      alert('All save slots are full! Delete a save to continue.');
      return;
    }

    const saveData: SaveGame = {
      id: `save_${Date.now()}`,
      name: saveName || `${currentGame.character.name}'s Adventure`,
      character: currentGame.character,
      adventure: currentGame.adventure,
      messages: currentGame.messages,
      timestamp: Date.now(),
      playTime: currentGame.playTime
    };

    if (saveGame(slot, saveData)) {
      setShowSaveDialog(false);
      setSaveName('');
      setSelectedSlot(-1);
      refreshSaves();
      alert('Game saved successfully!');
    } else {
      alert('Failed to save game.');
    }
  };

  const handleLoad = (slot: number) => {
    if (!isBrowser) return;
    
    const saveData = loadGame(slot);
    if (saveData) {
      onLoad(saveData);
      onClose();
    }
  };

  const handleDelete = (slot: number) => {
    if (!isBrowser) return;
    
    if (confirm('Are you sure you want to delete this save?')) {
      if (deleteSave(slot)) {
        refreshSaves();
      }
    }
  };

  const handleExport = (saveData: SaveGame) => {
    if (!isBrowser) return;
    exportSave(saveData);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isBrowser) return;
    
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const saveData = await importSave(file);
      const slot = getNextAvailableSlot();
      
      if (slot >= 0) {
        saveGame(slot, saveData);
        refreshSaves();
        alert('Save imported successfully!');
      } else {
        alert('All save slots are full!');
      }
    } catch (error) {
      alert('Failed to import save file.');
    }
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-amber-50 rounded-lg border-4 border-amber-900/30 p-8 max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl"
          style={{ 
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
          }}
        >
          {/* Header */}
          <div className="flex justify-between items-center mb-6 pb-4 border-b-2 border-amber-900/20">
            <div>
              <h2 className="text-3xl font-serif font-bold text-stone-900">Save & Load</h2>
              <p className="text-sm font-serif text-stone-600 italic">Manage your adventures</p>
            </div>
            <button
              onClick={onClose}
              className="text-stone-600 hover:text-stone-900 text-2xl leading-none"
            >
              ×
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mb-6">
            {currentGame && (
              <button
                onClick={() => setShowSaveDialog(true)}
                className="flex-1 bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3 px-4 rounded border-2 border-amber-900 transition"
              >
                💾 Save Current Game
              </button>
            )}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 bg-blue-700 hover:bg-blue-800 text-blue-50 font-serif font-bold py-3 px-4 rounded border-2 border-blue-900 transition"
            >
              📁 Import Save
            </button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />

          {/* Save Dialog */}
          {showSaveDialog && (
            <div className="mb-6 p-4 bg-amber-100 border-2 border-amber-800 rounded-lg">
              <h3 className="font-serif font-bold text-stone-900 mb-3">Save Game</h3>
              <input
                type="text"
                value={saveName}
                onChange={(e) => setSaveName(e.target.value)}
                placeholder={`${currentGame?.character.name}'s Adventure`}
                className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-2 font-serif mb-3"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-white font-serif font-bold py-2 px-4 rounded border-2 border-green-900 transition"
                >
                  Confirm Save
                </button>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setSaveName('');
                  }}
                  className="flex-1 bg-stone-400 hover:bg-stone-500 text-stone-800 font-serif font-bold py-2 px-4 rounded border-2 border-stone-500 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Save Slots List */}
          <div className="flex-1 overflow-y-auto">
            {saves.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📜</div>
                <p className="text-stone-600 font-serif italic">No saved games yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {Array.from({ length: 5 }).map((_, slotIndex) => {
                  // Find save for this slot
                  let slotSave = null;
                  if (isBrowser) {
                    const key = `dnd_save_${slotIndex}`;
                    const data = localStorage.getItem(key);
                    if (data) {
                      try {
                        slotSave = JSON.parse(data);
                      } catch (e) {
                        // Invalid data
                      }
                    }
                  }

                  if (!slotSave) {
                    return (
                      <div
                        key={slotIndex}
                        className="bg-white/30 border-2 border-dashed border-stone-400 rounded-lg p-4 text-center"
                      >
                        <p className="text-stone-500 font-serif italic text-sm">
                          Slot {slotIndex + 1} - Empty
                        </p>
                      </div>
                    );
                  }

                  return (
                    <motion.div
                      key={slotIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white/50 border-2 border-amber-900/20 rounded-lg p-4 hover:border-amber-700/50 transition"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-serif font-bold text-stone-900 text-lg">
                            {slotSave.name}
                          </h3>
                          <p className="text-sm font-serif text-stone-600">
                            {slotSave.character.name} • Lvl {slotSave.character.level} {slotSave.character.race} {slotSave.character.class}
                          </p>
                        </div>
                        <span className="text-xs font-serif text-stone-500 bg-stone-200 px-2 py-1 rounded">
                          Slot {slotIndex + 1}
                        </span>
                      </div>

                      <div className="text-xs font-serif text-stone-600 mb-3">
                        <span className="mr-4">📅 {formatSaveDate(slotSave.timestamp)}</span>
                        <span className="mr-4">⏱️ {formatPlayTime(slotSave.playTime)}</span>
                        <span>💬 {slotSave.messages.length} messages</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleLoad(slotIndex)}
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-serif font-semibold py-2 px-3 rounded text-sm transition"
                        >
                          Load
                        </button>
                        <button
                          onClick={() => handleExport(slotSave)}
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-serif font-semibold py-2 px-3 rounded text-sm transition"
                        >
                          Export
                        </button>
                        <button
                          onClick={() => handleDelete(slotIndex)}
                          className="flex-1 bg-red-600 hover:bg-red-700 text-white font-serif font-semibold py-2 px-3 rounded text-sm transition"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
