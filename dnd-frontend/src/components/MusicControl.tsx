'use client';

import { Volume2, VolumeX, Music } from 'lucide-react';
import { useState } from 'react';

interface MusicControlProps {
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute: () => void;
  onVolumeChange: (volume: number) => void;
}

export default function MusicControl({
  isPlaying,
  isMuted,
  onToggleMute,
  onVolumeChange
}: MusicControlProps) {
  const [volume, setVolume] = useState(0.25);
  const [showSlider, setShowSlider] = useState(false);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    onVolumeChange(newVolume);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowSlider(!showSlider)}
        className="bg-amber-800/80 hover:bg-amber-900 text-amber-50 p-2 rounded border-2 border-amber-900/50 transition flex items-center gap-2"
        title="Music controls"
      >
        <Music className="w-4 h-4" />
      </button>

      {showSlider && (
        <div className="absolute bottom-full right-0 mb-2 bg-amber-50 border-2 border-amber-900/30 rounded p-3 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={onToggleMute} className="text-stone-700 hover:text-amber-800">
              {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-24"
            />
          </div>
          {isPlaying && <p className="text-xs text-stone-600 font-serif">♪ Playing</p>}
        </div>
      )}
    </div>
  );
}
