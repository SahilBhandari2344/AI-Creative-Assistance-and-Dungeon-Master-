import { SaveGame } from '../types/saveGame';

const SAVE_KEY_PREFIX = 'dnd_save_';
const MAX_SAVES = 5;

// Check if we're in browser
const isBrowser = typeof window !== 'undefined';

// Get all saves from localStorage
export function getAllSaves(): SaveGame[] {
  if (!isBrowser) return [];
  
  const saves: SaveGame[] = [];
  
  for (let i = 0; i < MAX_SAVES; i++) {
    const key = `${SAVE_KEY_PREFIX}${i}`;
    const saveData = localStorage.getItem(key);
    
    if (saveData) {
      try {
        saves.push(JSON.parse(saveData));
      } catch (error) {
        console.error(`Error loading save ${i}:`, error);
      }
    }
  }
  
  return saves.sort((a, b) => b.timestamp - a.timestamp);
}

// Save game to specific slot
export function saveGame(slotIndex: number, saveGame: SaveGame): boolean {
  if (!isBrowser) return false;
  
  try {
    const key = `${SAVE_KEY_PREFIX}${slotIndex}`;
    localStorage.setItem(key, JSON.stringify(saveGame));
    return true;
  } catch (error) {
    console.error('Error saving game:', error);
    return false;
  }
}

// Load game from specific slot
export function loadGame(slotIndex: number): SaveGame | null {
  if (!isBrowser) return null;
  
  try {
    const key = `${SAVE_KEY_PREFIX}${slotIndex}`;
    const saveData = localStorage.getItem(key);
    
    if (saveData) {
      return JSON.parse(saveData);
    }
  } catch (error) {
    console.error('Error loading game:', error);
  }
  
  return null;
}

// Delete save from slot
export function deleteSave(slotIndex: number): boolean {
  if (!isBrowser) return false;
  
  try {
    const key = `${SAVE_KEY_PREFIX}${slotIndex}`;
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error deleting save:', error);
    return false;
  }
}

// Find next available save slot
export function getNextAvailableSlot(): number {
  if (!isBrowser) return -1;
  
  for (let i = 0; i < MAX_SAVES; i++) {
    const key = `${SAVE_KEY_PREFIX}${i}`;
    if (!localStorage.getItem(key)) {
      return i;
    }
  }
  return -1; // All slots full
}

// Export save as JSON file
export function exportSave(saveGame: SaveGame): void {
  if (!isBrowser) return;
  
  const dataStr = JSON.stringify(saveGame, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${saveGame.name.replace(/[^a-z0-9]/gi, '_')}_${Date.now()}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Import save from JSON file
export function importSave(file: File): Promise<SaveGame> {
  return new Promise((resolve, reject) => {
    if (!isBrowser) {
      reject(new Error('Not in browser'));
      return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const saveGame = JSON.parse(e.target?.result as string);
        resolve(saveGame);
      } catch (error) {
        reject(new Error('Invalid save file'));
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

// Format timestamp for display
export function formatSaveDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString();
}

// Format play time
export function formatPlayTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}
