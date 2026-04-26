'use client';

import { useState, useRef, useCallback } from 'react';
// ✅ Changed: import from api.ts (FastAPI backend) instead of gemini.ts
import { sendDMMessage, buildSystemContext, DMMessage } from '../lib/api';
import EnhancedCharacterCreation from './EnhancedCharacterCreation';
import AdventureSelection from './AdventureSelection';
import CharacterStats from './CharacterStats';
import TabletopChat from './TabletopChat';
import QuickActions from './QuickActions';
import SaveLoadMenu from './SaveLoadMenu';
import YouTubeMusicPlayer from './YouTubeMusicPlayer';
import { Character } from '../types/character';
import { Adventure } from '../types/adventure';
import { SaveGame } from '../types/saveGame';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  role: 'user' | 'dm' | 'companion';
  content: string;
  companionName?: string;
}

// Parse companion dialogue from DM text.
// Handles: **Name**: "quote", **Name**: quote, **Name**: *action* "quote"
// Captures everything until the next companion tag or end of string.
// playerName is excluded so the player character is never misidentified as a companion.
function parseCompanionDialogue(
  dmText: string,
  companions: Array<{ name: string }>,
  playerName?: string
): Message[] {
  if (!companions || companions.length === 0) {
    return [{ role: 'dm', content: dmText }];
  }

  // Never treat the player's own character as a companion
  const validCompanions = companions.filter(
    c => !playerName || c.name.toLowerCase() !== playerName.toLowerCase()
  );

  if (validCompanions.length === 0) {
    return [{ role: 'dm', content: dmText }];
  }

  // Escape special regex chars in names
  const escapedNames = validCompanions.map(c =>
    c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  );
  const companionNames = escapedNames.join('|');

  // Match **Name**: and capture everything after it until the next **Name**: or end
  const splitPattern = new RegExp(
    `\\*\\*(${companionNames})\\*\\*:\\s*`,
    'gi'
  );

  const matches: Array<{ index: number; name: string; fullMatchLength: number }> = [];
  let match;
  while ((match = splitPattern.exec(dmText)) !== null) {
    matches.push({
      index: match.index,
      name: match[1],
      fullMatchLength: match[0].length,
    });
  }

  if (matches.length === 0) {
    return [{ role: 'dm', content: dmText }];
  }

  const messages: Message[] = [];
  let currentIndex = 0;

  matches.forEach((m, i) => {
    // DM narration before this companion line
    const narration = dmText.slice(currentIndex, m.index).trim();
    if (narration) messages.push({ role: 'dm', content: narration });

    // Companion speech: from after the tag until the next tag (or end)
    const speechStart = m.index + m.fullMatchLength;
    const speechEnd = i + 1 < matches.length ? matches[i + 1].index : dmText.length;
    let speech = dmText.slice(speechStart, speechEnd).trim();

    // Strip surrounding quotes if present
    speech = speech.replace(/^["'\u201C\u2018]|["'\u201D\u2019]$/g, '').trim();
    // Strip asterisk actions like *her eyes snap* at start
    speech = speech.replace(/^\*[^*]+\*\s*/, '').trim();
    // Strip surrounding quotes again after action removal
    speech = speech.replace(/^["'\u201C\u2018]|["'\u201D\u2019]$/g, '').trim();

    if (speech) {
      messages.push({ role: 'companion', content: speech, companionName: m.name });
    }

    currentIndex = speechEnd;
  });

  // Any remaining DM text after last companion line
  const tail = dmText.slice(currentIndex).trim();
  if (tail) messages.push({ role: 'dm', content: tail });

  return messages.length > 0 ? messages : [{ role: 'dm', content: dmText }];
}

export default function ChatInterface() {
  const [character, setCharacter] = useState<(Character & {
    stats?: Record<string, number>;
    skills?: string[];
    flaw?: string;
    trait?: string;
    background?: string;
    companions?: Array<{ name: string; race: string; class: string; personality: string }>;
  }) | null>(null);
  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [dmHistory, setDmHistory] = useState<DMMessage[]>([]);
  const [systemContext, setSystemContext] = useState<string>('');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [showConfirmExit, setShowConfirmExit] = useState(false);
  const [showSaveLoadMenu, setShowSaveLoadMenu] = useState(false);
  const [totalPlayTime, setTotalPlayTime] = useState<number>(0);
  const playTimeStart = useRef<number>(Date.now());

  const handleCharacterCreated = (newCharacter: Character & {
    stats: Record<string, number>;
    skills: string[];
    flaw: string;
    trait: string;
    companions: Array<{ name: string; race: string; class: string; personality: string }>;
  }) => {
    setCharacter(newCharacter);
  };

  // Stream a response from the FastAPI DM backend
  const streamDMResponse = useCallback(async (
    history: DMMessage[],
    ctx: string,
    companions: Array<{ name: string }>,
    playerName?: string
  ): Promise<{ parsedMessages: Message[]; fullText: string; newHistory: DMMessage[] }> => {
    const reader = await sendDMMessage(history, ctx);
    const decoder = new TextDecoder();
    let fullText = '';

    setStreamingText('');
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      fullText += chunk;
      setStreamingText(fullText);
    }
    setStreamingText('');

    const parsedMessages = parseCompanionDialogue(fullText, companions, playerName);
    const newHistory: DMMessage[] = [
      ...history,
      { role: 'model', content: fullText },
    ];

    return { parsedMessages, fullText, newHistory };
  }, []);

  const handleAdventureSelected = async (selectedAdventure: Adventure) => {
    setAdventure(selectedAdventure);
    setLoading(true);

    try {
      const ctx = buildSystemContext(character!, selectedAdventure);
      setSystemContext(ctx);

      const introPrompt = `Begin the adventure! Introduce the scene vividly. Have the companions react using the **Name**: "quote" format.`;

      const initialHistory: DMMessage[] = [{ role: 'user', content: introPrompt }];
      const { parsedMessages, newHistory } = await streamDMResponse(
        initialHistory,
        ctx,
        character!.companions || [],
        character!.name
      );

      setDmHistory(newHistory);
      setMessages(parsedMessages);
    } catch (error) {
      console.error('Error starting game:', error);
      setMessages([{ role: 'dm', content: 'Error connecting to the DM. Please refresh and try again.' }]);
    }
    setLoading(false);
  };

  const handleBackToAdventures = () => {
    setAdventure(null);
    setMessages([]);
    setDmHistory([]);
    setStreamingText('');
    setShowConfirmExit(false);
  };

  const handleBackToDashboard = () => {
    setCharacter(null);
    setAdventure(null);
    setMessages([]);
    setDmHistory([]);
    setStreamingText('');
    setShowConfirmExit(false);
  };

  const handleLoadSave = (saveGame: SaveGame) => {
    setCharacter(saveGame.character);
    setAdventure(saveGame.adventure);
    setMessages(saveGame.messages);
    setTotalPlayTime(saveGame.playTime);
    playTimeStart.current = Date.now();

    const ctx = buildSystemContext(saveGame.character, saveGame.adventure);
    setSystemContext(ctx);

    const rebuilt: DMMessage[] = saveGame.messages.slice(-10).map(m => ({
      role: m.role === 'user' ? 'user' : 'model',
      content: m.content,
    }));
    setDmHistory(rebuilt);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const newHistory: DMMessage[] = [...dmHistory, { role: 'user', content: userMessage }];
      const { parsedMessages, newHistory: updatedHistory } = await streamDMResponse(
        newHistory,
        systemContext,
        character!.companions || [],
        character!.name
      );

      setDmHistory(updatedHistory);
      setMessages(prev => [...prev, ...parsedMessages]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [...prev, { role: 'dm', content: 'The DM seems distracted... Try again.' }]);
    }

    setLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!character) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowSaveLoadMenu(true)}
          className="fixed top-4 right-4 z-50 bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3 px-6 rounded-lg border-2 border-amber-900 shadow-xl transition flex items-center gap-2"
        >
          <span>📁</span>
          <span>Load Game</span>
        </button>
        <EnhancedCharacterCreation onComplete={handleCharacterCreated} />
        <SaveLoadMenu
          isOpen={showSaveLoadMenu}
          onClose={() => setShowSaveLoadMenu(false)}
          onLoad={handleLoadSave}
        />
      </div>
    );
  }

  if (!adventure) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-amber-900/20 via-stone-900 to-stone-950 relative">
        <div className="bg-stone-900/50 backdrop-blur-sm p-4 border-b border-stone-700/50">
          <div className="flex justify-between items-center max-w-6xl mx-auto">
            <button
              onClick={handleBackToDashboard}
              className="text-amber-200 hover:text-amber-100 transition flex items-center gap-2 font-serif"
            >
              ← Back to Character Sheet
            </button>
            <button
              onClick={() => setShowSaveLoadMenu(true)}
              className="bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-2 px-6 rounded-lg border-2 border-amber-900 shadow-lg transition flex items-center gap-2"
            >
              <span>📁</span>
              <span>Load Game</span>
            </button>
          </div>
        </div>
        <AdventureSelection onSelect={handleAdventureSelected} />
        <SaveLoadMenu
          isOpen={showSaveLoadMenu}
          onClose={() => setShowSaveLoadMenu(false)}
          onLoad={handleLoadSave}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-transparent">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/5 via-transparent to-transparent pointer-events-none" />

      <CharacterStats character={character} />
      <YouTubeMusicPlayer defaultVideoId="sHGaUGWha1M" />

      <AnimatePresence>
        {showConfirmExit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowConfirmExit(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-amber-50 rounded border-4 border-amber-900/30 p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-4">Leave Adventure?</h2>
              <p className="text-stone-700 font-serif mb-6">Your progress will be lost unless you save. Are you sure?</p>
              <div className="space-y-2">
                <button onClick={() => { setShowConfirmExit(false); setShowSaveLoadMenu(true); }}
                  className="w-full bg-green-700 hover:bg-green-800 text-green-50 font-serif font-bold py-3 px-4 rounded border-2 border-green-900 transition">
                  💾 Save First
                </button>
                <button onClick={handleBackToAdventures}
                  className="w-full bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3 px-4 rounded border-2 border-amber-900 transition">
                  Change Adventure
                </button>
                <button onClick={handleBackToDashboard}
                  className="w-full bg-red-700 hover:bg-red-800 text-red-50 font-serif font-bold py-3 px-4 rounded border-2 border-red-900 transition">
                  New Character
                </button>
                <button onClick={() => setShowConfirmExit(false)}
                  className="w-full bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-3 px-4 rounded border-2 border-stone-400 transition">
                  Stay in Game
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-gradient-to-b from-amber-950/80 to-stone-900/80 backdrop-blur-sm border-b-4 border-amber-900/40 p-4 shadow-lg relative z-10">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button onClick={() => setShowConfirmExit(true)}
              className="text-amber-200 hover:text-amber-100 transition font-serif flex items-center gap-1"
              title="Leave adventure">
              ← Menu
            </button>
            <div className="border-l-2 border-amber-800/50 pl-4">
              <h1 className="text-xl font-serif font-bold text-amber-100">{adventure.title}</h1>
              <p className="text-stone-400 text-sm font-serif italic">Session in progress</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setShowSaveLoadMenu(true)}
              className="bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-semibold py-2 px-4 rounded border-2 border-amber-900 transition flex items-center gap-2">
              <span>💾</span><span>Save</span>
            </button>
            <div className="text-right bg-amber-50/90 px-4 py-2 rounded border-2 border-amber-900/30 shadow">
              <div className="text-stone-900 font-serif font-bold">{character.name}</div>
              <div className="text-stone-600 text-sm font-serif">Lvl {character.level} {character.race} {character.class}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 relative overflow-hidden">
        <TabletopChat
          messages={messages}
          playerName={character.name}
          loading={loading}
          streamingText={streamingText}
        />
      </div>

      <div className="bg-gradient-to-t from-stone-950 to-stone-900/80 backdrop-blur-sm border-t-4 border-amber-900/40 p-4 shadow-lg relative z-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-3 items-end">
            <QuickActions onAction={(action) => setInput(action)} disabled={loading} />
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="What do you do?"
              disabled={loading}
              className="flex-1 bg-amber-50/90 text-stone-900 rounded border-2 border-amber-900/30 px-4 py-3 font-serif focus:outline-none focus:border-amber-700 disabled:opacity-50 transition placeholder:text-stone-500 placeholder:italic"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-amber-800 hover:bg-amber-900 disabled:bg-stone-600 text-amber-50 font-serif font-bold py-3 px-8 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed shadow-lg"
            >
              Act
            </button>
          </div>
          <p className="text-stone-500 text-xs mt-2 font-serif italic text-center">
            Press Enter to send • Shift+Enter for new line • ⚡ for quick actions
          </p>
        </div>
      </div>

      <SaveLoadMenu
        isOpen={showSaveLoadMenu}
        onClose={() => setShowSaveLoadMenu(false)}
        onLoad={handleLoadSave}
        currentGame={
          character && adventure
            ? {
                character,
                adventure,
                messages,
                playTime: totalPlayTime + Math.floor((Date.now() - playTimeStart.current) / 1000),
              }
            : undefined
        }
      />
    </div>
  );
}
