'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Adventure } from '../types/adventure';

interface AdventureEditorProps {
  onSave: (adventure: Adventure) => void;
  onClose: () => void;
}

interface Encounter {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  enemies: string[];
}

interface NPC {
  id: string;
  name: string;
  role: string;
  personality: string;
  appearance: string;
}

export default function AdventureEditor({ onSave, onClose }: AdventureEditorProps) {
  const [step, setStep] = useState(1);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [setting, setSetting] = useState('');
  const [difficulty, setDifficulty] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const [estimatedTime, setEstimatedTime] = useState('1-2 hours');
  
  // Encounters
  const [encounters, setEncounters] = useState<Encounter[]>([]);
  const [newEncounter, setNewEncounter] = useState<Encounter>({
    id: '',
    name: '',
    description: '',
    difficulty: 'Medium',
    enemies: []
  });
  const [enemyInput, setEnemyInput] = useState('');

  // NPCs
  const [npcs, setNPCs] = useState<NPC[]>([]);
  const [newNPC, setNewNPC] = useState<NPC>({
    id: '',
    name: '',
    role: '',
    personality: '',
    appearance: ''
  });

  // Story hooks
  const [hooks, setHooks] = useState<string[]>(['']);
  const [goals, setGoals] = useState<string[]>(['']);
  const [rewards, setRewards] = useState<string[]>(['']);

  const addEncounter = () => {
    if (newEncounter.name && newEncounter.description) {
      setEncounters([...encounters, { ...newEncounter, id: Date.now().toString() }]);
      setNewEncounter({
        id: '',
        name: '',
        description: '',
        difficulty: 'Medium',
        enemies: []
      });
      setEnemyInput('');
    }
  };

  const removeEncounter = (id: string) => {
    setEncounters(encounters.filter(e => e.id !== id));
  };

  const addEnemyToEncounter = () => {
    if (enemyInput.trim()) {
      setNewEncounter({
        ...newEncounter,
        enemies: [...newEncounter.enemies, enemyInput.trim()]
      });
      setEnemyInput('');
    }
  };

  const removeEnemyFromEncounter = (enemy: string) => {
    setNewEncounter({
      ...newEncounter,
      enemies: newEncounter.enemies.filter(e => e !== enemy)
    });
  };

  const addNPC = () => {
    if (newNPC.name && newNPC.role) {
      setNPCs([...npcs, { ...newNPC, id: Date.now().toString() }]);
      setNewNPC({
        id: '',
        name: '',
        role: '',
        personality: '',
        appearance: ''
      });
    }
  };

  const removeNPC = (id: string) => {
    setNPCs(npcs.filter(n => n.id !== id));
  };

  const updateArrayField = (
    array: string[],
    setter: (arr: string[]) => void,
    index: number,
    value: string
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayField = (array: string[], setter: (arr: string[]) => void) => {
    setter([...array, '']);
  };

  const removeArrayField = (array: string[], setter: (arr: string[]) => void, index: number) => {
    setter(array.filter((_, i) => i !== index));
  };

  const generateAdventureCode = () => {
    return `ADV-${Date.now().toString(36).toUpperCase()}`;
  };

  const handleSave = () => {
  // Auto-generate tags based on content
  const autoTags: string[] = ['Custom'];
  
  if (encounters.length > 0) autoTags.push('Combat');
  if (npcs.length > 0) autoTags.push('NPCs');
  if (encounters.some(e => e.difficulty === 'Deadly' || e.difficulty === 'Hard')) {
    autoTags.push('High Stakes');
  }
  
  const adventurePrompt = `
ADVENTURE: ${title}

SETTING: ${setting}

DESCRIPTION: ${description}

STORY HOOKS:
${hooks.filter(h => h.trim()).map((h, i) => `${i + 1}. ${h}`).join('\n')}

MAIN GOALS:
${goals.filter(g => g.trim()).map((g, i) => `${i + 1}. ${g}`).join('\n')}

KEY NPCs:
${npcs.map(npc => `
- ${npc.name} (${npc.role})
  Personality: ${npc.personality}
  Appearance: ${npc.appearance}
`).join('\n')}

ENCOUNTERS:
${encounters.map((enc, i) => `
${i + 1}. ${enc.name} (${enc.difficulty})
   ${enc.description}
   Enemies: ${enc.enemies.join(', ')}
`).join('\n')}

REWARDS:
${rewards.filter(r => r.trim()).map((r, i) => `${i + 1}. ${r}`).join('\n')}

Begin this adventure and guide the player through this story.
  `.trim();

  const adventure: Adventure = {
    id: Date.now().toString(),
    title,
    description,
    difficulty,
    estimatedTime,
    tags: autoTags,
    prompt: adventurePrompt,
    code: generateAdventureCode(),
    custom: true,
    encounters,
    npcs
  };

  onSave(adventure);
};


  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-amber-50 rounded-lg border-4 border-amber-900/30 p-8 max-w-4xl w-full my-8 shadow-2xl"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
        }}
      >
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-serif font-bold text-stone-900">Adventure Editor</h2>
            <p className="text-sm font-serif text-stone-600 italic">Create your own epic quest</p>
          </div>
          <button
            onClick={onClose}
            className="text-stone-600 hover:text-stone-900 text-3xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded mx-1 transition ${
                  s <= step ? 'bg-amber-700' : 'bg-stone-300'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm font-serif text-stone-600">
            Step {step} of 5
          </p>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Basic Information</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                    Adventure Title *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="The Lost Temple of Shadows"
                    className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                    Setting *
                  </label>
                  <input
                    type="text"
                    value={setting}
                    onChange={(e) => setSetting(e.target.value)}
                    placeholder="Ancient jungle ruins"
                    className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                    Short Description *
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="A mysterious temple holds an ancient artifact..."
                    rows={4}
                    className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                      Difficulty
                    </label>
                    <select
                      value={difficulty}
                      onChange={(e) => setDifficulty(e.target.value as any)}
                      className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                      Estimated Time
                    </label>
                    <input
                      type="text"
                      value={estimatedTime}
                      onChange={(e) => setEstimatedTime(e.target.value)}
                      placeholder="1-2 hours"
                      className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={onClose}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-3 px-6 rounded border-2 border-stone-400 transition"
                >
                  Cancel
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!title || !setting || !description}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-3 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
                >
                  Next: Story Elements →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Story Elements */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-h-[60vh] overflow-y-auto pr-2"
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Story Elements</h3>

              {/* Story Hooks */}
              <div className="mb-6">
                <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                  Story Hooks (How the adventure begins)
                </label>
                {hooks.map((hook, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={hook}
                      onChange={(e) => updateArrayField(hooks, setHooks, index, e.target.value)}
                      placeholder="A mysterious letter arrives..."
                      className="flex-1 bg-white border-2 border-amber-900/30 rounded px-4 py-2 font-serif text-sm text-stone-900"
                    />
                    {hooks.length > 1 && (
                      <button
                        onClick={() => removeArrayField(hooks, setHooks, index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField(hooks, setHooks)}
                  className="text-sm font-serif text-amber-700 hover:text-amber-900 font-semibold"
                >
                  + Add Hook
                </button>
              </div>

              {/* Goals */}
              <div className="mb-6">
                <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                  Main Goals (What players need to accomplish)
                </label>
                {goals.map((goal, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={goal}
                      onChange={(e) => updateArrayField(goals, setGoals, index, e.target.value)}
                      placeholder="Find the sacred artifact"
                      className="flex-1 bg-white border-2 border-amber-900/30 rounded px-4 py-2 font-serif text-sm text-stone-900"
                    />
                    {goals.length > 1 && (
                      <button
                        onClick={() => removeArrayField(goals, setGoals, index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField(goals, setGoals)}
                  className="text-sm font-serif text-amber-700 hover:text-amber-900 font-semibold"
                >
                  + Add Goal
                </button>
              </div>

              {/* Rewards */}
              <div>
                <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                  Rewards (What players earn)
                </label>
                {rewards.map((reward, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={reward}
                      onChange={(e) => updateArrayField(rewards, setRewards, index, e.target.value)}
                      placeholder="500 gold pieces, Magic sword"
                      className="flex-1 bg-white border-2 border-amber-900/30 rounded px-4 py-2 font-serif text-sm text-stone-900"
                    />
                    {rewards.length > 1 && (
                      <button
                        onClick={() => removeArrayField(rewards, setRewards, index)}
                        className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => addArrayField(rewards, setRewards)}
                  className="text-sm font-serif text-amber-700 hover:text-amber-900 font-semibold"
                >
                  + Add Reward
                </button>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-3 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3 px-6 rounded border-2 border-amber-900 transition"
                >
                  Next: Add NPCs →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: NPCs */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-h-[60vh] overflow-y-auto pr-2"
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Key NPCs</h3>

              {/* Existing NPCs */}
              {npcs.length > 0 && (
                <div className="mb-6 space-y-3">
                  {npcs.map((npc) => (
                    <div key={npc.id} className="bg-white/50 border-2 border-green-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-serif font-bold text-lg text-stone-900">{npc.name}</div>
                          <div className="text-sm font-serif text-stone-600">{npc.role}</div>
                        </div>
                        <button
                          onClick={() => removeNPC(npc.id)}
                          className="text-red-600 hover:text-red-800 font-bold text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-sm font-serif text-stone-700">
                        <div><strong>Personality:</strong> {npc.personality}</div>
                        <div><strong>Appearance:</strong> {npc.appearance}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add New NPC */}
              <div className="bg-blue-100 border-2 border-blue-600 rounded-lg p-4 mb-4">
                <h4 className="font-serif font-bold text-blue-900 mb-3">Add New NPC</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newNPC.name}
                    onChange={(e) => setNewNPC({ ...newNPC, name: e.target.value })}
                    placeholder="NPC Name (e.g., Eldrin the Wise)"
                    className="w-full bg-white border-2 border-blue-300 rounded px-3 py-2 font-serif text-sm"
                  />
                  <input
                    type="text"
                    value={newNPC.role}
                    onChange={(e) => setNewNPC({ ...newNPC, role: e.target.value })}
                    placeholder="Role (e.g., Village Elder, Merchant)"
                    className="w-full bg-white border-2 border-blue-300 rounded px-3 py-2 font-serif text-sm"
                  />
                  <input
                    type="text"
                    value={newNPC.personality}
                    onChange={(e) => setNewNPC({ ...newNPC, personality: e.target.value })}
                    placeholder="Personality (e.g., Wise but mysterious)"
                    className="w-full bg-white border-2 border-blue-300 rounded px-3 py-2 font-serif text-sm"
                  />
                  <input
                    type="text"
                    value={newNPC.appearance}
                    onChange={(e) => setNewNPC({ ...newNPC, appearance: e.target.value })}
                    placeholder="Appearance (e.g., Old man with long white beard)"
                    className="w-full bg-white border-2 border-blue-300 rounded px-3 py-2 font-serif text-sm"
                  />
                  <button
                    onClick={addNPC}
                    disabled={!newNPC.name || !newNPC.role}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-stone-400 text-white font-serif font-bold py-2 rounded transition"
                  >
                    + Add NPC
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-3 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3 px-6 rounded border-2 border-amber-900 transition"
                >
                  Next: Add Encounters →
                </button>
              </div>
            </motion.div>
          )}

           {/* Step 4: Encounters */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-h-[60vh] overflow-y-auto pr-2"
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Combat Encounters</h3>

              {/* Existing Encounters */}
              {encounters.length > 0 && (
                <div className="mb-6 space-y-3">
                  {encounters.map((encounter) => (
                    <div key={encounter.id} className="bg-white/50 border-2 border-red-600 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-serif font-bold text-lg text-stone-900">{encounter.name}</div>
                          <div className="inline-block px-2 py-0.5 rounded text-xs font-bold bg-red-100 text-red-800">
                            {encounter.difficulty}
                          </div>
                        </div>
                        <button
                          onClick={() => removeEncounter(encounter.id)}
                          className="text-red-600 hover:text-red-800 font-bold text-xl"
                        >
                          ×
                        </button>
                      </div>
                      <div className="text-sm font-serif text-stone-700 mb-2">
                        {encounter.description}
                      </div>
                      {encounter.enemies.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {encounter.enemies.map((enemy, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-red-200 text-red-900 rounded text-xs font-serif">
                              {enemy}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add New Encounter */}
              <div className="bg-red-100 border-2 border-red-600 rounded-lg p-4 mb-4">
                <h4 className="font-serif font-bold text-red-900 mb-3">Add New Encounter</h4>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={newEncounter.name}
                    onChange={(e) => setNewEncounter({ ...newEncounter, name: e.target.value })}
                    placeholder="Encounter Name (e.g., Goblin Ambush)"
                    className="w-full bg-white border-2 border-red-300 rounded px-3 py-2 font-serif text-sm"
                  />
                  
                  <select
                    value={newEncounter.difficulty}
                    onChange={(e) => setNewEncounter({ ...newEncounter, difficulty: e.target.value as any })}
                    className="w-full bg-white border-2 border-red-300 rounded px-3 py-2 font-serif text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Deadly">Deadly</option>
                  </select>

                  <textarea
                    value={newEncounter.description}
                    onChange={(e) => setNewEncounter({ ...newEncounter, description: e.target.value })}
                    placeholder="Describe the encounter... (e.g., A group of goblins jumps from the trees)"
                    rows={3}
                    className="w-full bg-white border-2 border-red-300 rounded px-3 py-2 font-serif text-sm resize-none"
                  />

                  {/* Enemy List */}
                  <div>
                    <label className="block text-xs font-serif font-semibold text-red-900 mb-1">
                      Enemies in this encounter:
                    </label>
                    {newEncounter.enemies.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {newEncounter.enemies.map((enemy, idx) => (
                          <span 
                            key={idx} 
                            className="px-2 py-1 bg-red-200 text-red-900 rounded text-xs font-serif flex items-center gap-1"
                          >
                            {enemy}
                            <button
                              onClick={() => removeEnemyFromEncounter(enemy)}
                              className="font-bold hover:text-red-700"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={enemyInput}
                        onChange={(e) => setEnemyInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && addEnemyToEncounter()}
                        placeholder="Add enemy (e.g., 3x Goblins)"
                        className="flex-1 bg-white border-2 border-red-300 rounded px-3 py-1 font-serif text-xs"
                      />
                      <button
                        onClick={addEnemyToEncounter}
                        className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={addEncounter}
                    disabled={!newEncounter.name || !newEncounter.description}
                    className="w-full bg-red-600 hover:bg-red-700 disabled:bg-stone-400 text-white font-serif font-bold py-2 rounded transition"
                  >
                    + Add Encounter
                  </button>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-3 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3 px-6 rounded border-2 border-amber-900 transition"
                >
                  Next: Review & Save →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Review & Save */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="max-h-[60vh] overflow-y-auto pr-2"
            >
              <h3 className="text-xl font-serif font-bold text-stone-900 mb-4">Review Your Adventure</h3>

              <div className="space-y-4">
                {/* Basic Info */}
                <div className="bg-white/60 border-2 border-amber-900/30 rounded-lg p-4">
                  <h4 className="font-serif font-bold text-amber-900 mb-2 text-lg">{title}</h4>
                  <div className="text-sm font-serif text-stone-700 space-y-1">
                    <div><strong>Setting:</strong> {setting}</div>
                    <div><strong>Difficulty:</strong> {difficulty}</div>
                    <div><strong>Time:</strong> {estimatedTime}</div>
                    <div className="mt-2">{description}</div>
                  </div>
                </div>

                {/* Story Elements */}
                <div className="bg-white/60 border-2 border-amber-900/30 rounded-lg p-4">
                  <h4 className="font-serif font-bold text-stone-900 mb-2">Story Elements</h4>
                  <div className="text-sm font-serif text-stone-700 space-y-2">
                    {hooks.filter(h => h.trim()).length > 0 && (
                      <div>
                        <strong>Hooks:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {hooks.filter(h => h.trim()).map((h, i) => (
                            <li key={i}>{h}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {goals.filter(g => g.trim()).length > 0 && (
                      <div>
                        <strong>Goals:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {goals.filter(g => g.trim()).map((g, i) => (
                            <li key={i}>{g}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {rewards.filter(r => r.trim()).length > 0 && (
                      <div>
                        <strong>Rewards:</strong>
                        <ul className="list-disc list-inside ml-2">
                          {rewards.filter(r => r.trim()).map((r, i) => (
                            <li key={i}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                {/* NPCs */}
                {npcs.length > 0 && (
                  <div className="bg-white/60 border-2 border-green-600 rounded-lg p-4">
                    <h4 className="font-serif font-bold text-green-900 mb-2">NPCs ({npcs.length})</h4>
                    <div className="space-y-2">
                      {npcs.map((npc) => (
                        <div key={npc.id} className="text-sm font-serif text-stone-700">
                          <strong>{npc.name}</strong> ({npc.role})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Encounters */}
                {encounters.length > 0 && (
                  <div className="bg-white/60 border-2 border-red-600 rounded-lg p-4">
                    <h4 className="font-serif font-bold text-red-900 mb-2">Encounters ({encounters.length})</h4>
                    <div className="space-y-2">
                      {encounters.map((enc) => (
                        <div key={enc.id} className="text-sm font-serif text-stone-700">
                          <strong>{enc.name}</strong> ({enc.difficulty})
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Share Code Preview */}
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-600 rounded-lg p-4">
                  <h4 className="font-serif font-bold text-purple-900 mb-2">🔗 Share Code</h4>
                  <p className="text-sm font-serif text-stone-700 mb-2">
                    Your adventure will get a unique code that others can use to play it!
                  </p>
                  <div className="bg-white rounded px-3 py-2 font-mono text-purple-700 font-bold text-center">
                    {generateAdventureCode()}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-3 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-serif font-bold py-3 px-6 rounded border-2 border-green-800 transition shadow-lg"
                >
                  💾 Save Adventure
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
        