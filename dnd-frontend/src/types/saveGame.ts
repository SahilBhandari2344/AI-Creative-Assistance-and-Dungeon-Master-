import { Character } from './character';
import { Adventure } from './adventure';

export interface SaveGame {
  id: string;
  name: string; // Custom save name
  character: Character;
  adventure: Adventure;
  messages: Array<{ role: 'user' | 'dm'; content: string }>;
  timestamp: number; // When saved
  playTime: number; // Total play time in seconds
}

export interface SaveSlot {
  slot: number;
  saveGame: SaveGame | null;
}
