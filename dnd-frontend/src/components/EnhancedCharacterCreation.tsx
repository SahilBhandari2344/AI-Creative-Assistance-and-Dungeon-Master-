'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '../types/character';

interface EnhancedCharacterCreationProps {
  onComplete: (character: Character & { 
    stats: Record<string, number>;
    skills: string[];
    flaw: string;
    trait: string;
    companions: Array<{
      name: string;
      race: string;
      class: string;
      personality: string;
    }>;
  }) => void;
}

type StatAllocationMethod = 'pointbuy' | 'standard' | 'roll';

const CLASSES = ['Fighter', 'Wizard', 'Rogue', 'Cleric', 'Ranger', 'Paladin'];
const RACES = ['Human', 'Elf', 'Dwarf', 'Halfling', 'Dragonborn', 'Tiefling'];

// Standard Array
const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];

// Point Buy costs
const POINT_BUY_COSTS: Record<number, number> = {
  8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9
};

// Skills by class
const CLASS_SKILLS: Record<string, string[]> = {
  Fighter: ['Acrobatics', 'Animal Handling', 'Athletics', 'History', 'Insight', 'Intimidation', 'Perception', 'Survival'],
  Wizard: ['Arcana', 'History', 'Insight', 'Investigation', 'Medicine', 'Religion'],
  Rogue: ['Acrobatics', 'Athletics', 'Deception', 'Insight', 'Intimidation', 'Investigation', 'Perception', 'Performance', 'Persuasion', 'Sleight of Hand', 'Stealth'],
  Cleric: ['History', 'Insight', 'Medicine', 'Persuasion', 'Religion'],
  Ranger: ['Animal Handling', 'Athletics', 'Insight', 'Investigation', 'Nature', 'Perception', 'Stealth', 'Survival'],
  Paladin: ['Athletics', 'Insight', 'Intimidation', 'Medicine', 'Persuasion', 'Religion'],
};

const SKILL_COUNT: Record<string, number> = {
  Fighter: 2,
  Wizard: 2,
  Rogue: 4,
  Cleric: 2,
  Ranger: 3,
  Paladin: 2,
};

// Character Flaws
const FLAWS = [
  { id: 'drunkard', name: 'Drunkard', desc: 'You have a drinking problem that clouds your judgment', emoji: '🍺' },
  { id: 'coward', name: 'Cowardly', desc: 'You flee from danger more easily than others', emoji: '😰' },
  { id: 'greedy', name: 'Greedy', desc: 'Gold and treasure tempt you beyond reason', emoji: '💰' },
  { id: 'arrogant', name: 'Arrogant', desc: 'You think you\'re better than everyone', emoji: '😤' },
  { id: 'reckless', name: 'Reckless', desc: 'You act without thinking of consequences', emoji: '⚡' },
  { id: 'paranoid', name: 'Paranoid', desc: 'You trust no one and see threats everywhere', emoji: '👁️' },
  { id: 'lazy', name: 'Lazy', desc: 'You avoid hard work whenever possible', emoji: '😴' },
  { id: 'vengeful', name: 'Vengeful', desc: 'You never forget a slight and seek revenge', emoji: '⚔️' },
];

// Personality Traits
const TRAITS = [
  { id: 'brave', name: 'Brave', desc: 'You face danger with courage' },
  { id: 'curious', name: 'Curious', desc: 'You love learning new things' },
  { id: 'friendly', name: 'Friendly', desc: 'You make friends easily' },
  { id: 'serious', name: 'Serious', desc: 'You rarely joke around' },
  { id: 'optimistic', name: 'Optimistic', desc: 'You always see the bright side' },
  { id: 'cynical', name: 'Cynical', desc: 'You expect the worst from people' },
  { id: 'honorable', name: 'Honorable', desc: 'You keep your word no matter what' },
  { id: 'cunning', name: 'Cunning', desc: 'You think several steps ahead' },
];

export default function EnhancedCharacterCreation({ onComplete }: EnhancedCharacterCreationProps) {
  const [step, setStep] = useState<number | 1.5>(1);
  
  // Basic Info
  const [name, setName] = useState('');
  const [race, setRace] = useState('');
  const [characterClass, setCharacterClass] = useState('');
  
  // Background
  const [background, setBackground] = useState('');
  const [generatingBackground, setGeneratingBackground] = useState(false);
  const [generatedBackground, setGeneratedBackground] = useState('');
  const [showBackgroundApproval, setShowBackgroundApproval] = useState(false);
  
  // Companions
  const [customizeCompanions, setCustomizeCompanions] = useState(false);
  const [companions, setCompanions] = useState([
    { name: 'Thorin', race: 'Dwarf', class: 'Fighter', personality: 'Brave & Protective' },
    { name: 'Elena', race: 'Elf', class: 'Wizard', personality: 'Cautious & Analytical' },
    { name: 'Finn', race: 'Halfling', class: 'Rogue', personality: 'Cheeky & Impulsive' },
  ]);
  
  // Stats
  const [allocationMethod, setAllocationMethod] = useState<StatAllocationMethod>('pointbuy');
  const [stats, setStats] = useState({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 });
  const [pointsRemaining, setPointsRemaining] = useState(27);
  const [standardArrayValues, setStandardArrayValues] = useState<number[]>([...STANDARD_ARRAY]);
  const [standardArrayAssigned, setStandardArrayAssigned] = useState<Record<string, number | null>>({
    STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null
  });
  const [rolledStats, setRolledStats] = useState<number[]>([]);
  
  // Skills, Flaw, Trait
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedFlaw, setSelectedFlaw] = useState('');
  const [selectedTrait, setSelectedTrait] = useState('');

  // Roll 4d6, drop lowest
  const rollDice = () => {
    const rolls: number[] = [];
    for (let i = 0; i < 6; i++) {
      const fourDice = Array.from({ length: 4 }, () => Math.floor(Math.random() * 6) + 1);
      fourDice.sort((a, b) => b - a);
      const sum = fourDice[0] + fourDice[1] + fourDice[2]; // Top 3
      rolls.push(sum);
    }
    setRolledStats(rolls.sort((a, b) => b - a));
  };

  // Point Buy
  const adjustStat = (stat: string, delta: number) => {
    const currentValue = stats[stat as keyof typeof stats];
    const newValue = currentValue + delta;
    
    if (newValue < 8 || newValue > 15) return;
    
    const currentCost = POINT_BUY_COSTS[currentValue];
    const newCost = POINT_BUY_COSTS[newValue];
    const costDiff = newCost - currentCost;
    
    if (pointsRemaining - costDiff < 0) return;
    
    setStats({ ...stats, [stat]: newValue });
    setPointsRemaining(pointsRemaining - costDiff);
  };

  // Standard Array assignment
  const assignStandardArray = (stat: string, value: number) => {
    // Unassign previous value for this stat
    const previousValue = standardArrayAssigned[stat];
    if (previousValue !== null) {
      setStandardArrayValues([...standardArrayValues, previousValue].sort((a, b) => b - a));
    }
    
    // Remove value from available and assign
    setStandardArrayValues(standardArrayValues.filter(v => v !== value));
    setStandardArrayAssigned({ ...standardArrayAssigned, [stat]: value });
    setStats({ ...stats, [stat]: value });
  };

  // Skill selection
  const toggleSkill = (skill: string) => {
    const maxSkills = SKILL_COUNT[characterClass];
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter(s => s !== skill));
    } else if (selectedSkills.length < maxSkills) {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  // Background Generation
  const generateBackground = async () => {
    if (!name || !characterClass || !race) {
      alert('Please complete basic info first!');
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

  const handleSubmit = () => {
    const enhancedCharacter = {
      name,
      race,
      class: characterClass,
      level: 1,
      background: background || 'A mysterious adventurer seeking fortune and glory.',
      stats,
      skills: selectedSkills,
      flaw: selectedFlaw,
      trait: selectedTrait,
      companions,
    };
    onComplete(enhancedCharacter);
  };

  const displayStep = step === 1.5 ? 2 : (step > 1.5 ? (step as number) + 1 : step);

  return (
  <div 
    className="min-h-screen flex items-center justify-center p-4 relative"
    style={{
      backgroundImage: `url('/table-background2.jpg')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}
  >
    {/* Dark overlay for readability */}
    <div className="absolute inset-0 bg-black/30 pointer-events-none z-0" />
    
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-amber-50 rounded-lg border-4 border-amber-900/30 p-8 max-w-4xl w-full shadow-2xl max-h-[90vh] overflow-y-auto relative z-10"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
      }}
    >
      {/* All your form content stays the same */}
      <h1 className="text-4xl font-serif font-bold text-stone-900 mb-2 text-center">
        Create Your Hero
        </h1>
        <p className="text-center text-stone-600 font-serif italic mb-8">
          Step {displayStep} of 8
        </p>

        <AnimatePresence mode="wait">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Basic Information</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-700 mb-2">
                    Character Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your hero's name..."
                    className="w-full bg-white border-2 border-amber-900/30 rounded px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700"
                  />
                </div>

                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-700 mb-3">
                    Choose Your Race
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {RACES.map((r) => (
                      <button
                        key={r}
                        onClick={() => setRace(r)}
                        className={`p-4 rounded border-2 font-serif font-semibold transition ${
                          race === r
                            ? 'bg-amber-700 text-amber-50 border-amber-900'
                            : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-serif font-semibold text-stone-700 mb-3">
                    Choose Your Class
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {CLASSES.map((c) => (
                      <button
                        key={c}
                        onClick={() => setCharacterClass(c)}
                        className={`p-4 rounded border-2 font-serif font-semibold transition ${
                          characterClass === c
                            ? 'bg-amber-700 text-amber-50 border-amber-900'
                            : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(1.5)}
                disabled={!name || !race || !characterClass}
                className="w-full mt-8 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
              >
                Next: Choose Companions →
              </button>
            </motion.div>
          )}

          {/* Step 1.5: Companion Setup */}
          {step === 1.5 && (
            <motion.div
              key="step1.5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                Your Party Companions
              </h2>

              <div className="mb-6 p-5 bg-blue-100 border-2 border-blue-600 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-3xl">🎭</span>
                  <div>
                    <div className="font-serif font-bold text-blue-900 mb-1">
                      Three AI Companions Will Join You
                    </div>
                    <p className="text-sm font-serif text-blue-800">
                      These companions will fight alongside you, offer advice, and react to your choices. They have unique personalities that affect the story.
                    </p>
                  </div>
                </div>
              </div>

              {/* Choice: Default or Customize */}
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => setCustomizeCompanions(false)}
                  className={`w-full p-6 rounded-lg border-2 text-left transition ${
                    !customizeCompanions
                      ? 'bg-amber-700 text-amber-50 border-amber-900'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                  }`}
                >
                  <div className="font-serif font-bold text-lg mb-3">
                    ✓ Use Default Party (Recommended)
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">⚔️</span>
                      <span><strong>Thorin</strong> - Dwarf Fighter • Brave & Protective</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">✨</span>
                      <span><strong>Elena</strong> - Elf Wizard • Cautious & Analytical</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-xl">🗡️</span>
                      <span><strong>Finn</strong> - Halfling Rogue • Cheeky & Impulsive</span>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setCustomizeCompanions(true)}
                  className={`w-full p-6 rounded-lg border-2 text-left transition ${
                    customizeCompanions
                      ? 'bg-amber-700 text-amber-50 border-amber-900'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                  }`}
                >
                  <div className="font-serif font-bold text-lg mb-2">
                    🎨 Customize Your Party
                  </div>
                  <p className="text-sm opacity-90">
                    Choose names, races, classes, and personalities for each companion
                  </p>
                </button>
              </div>

              {/* Companion Customization */}
              {customizeCompanions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="space-y-6 mb-8"
                >
                  {companions.map((companion, index) => (
  <div key={`companion-${index}`} className="bg-white/50 border-2 border-amber-900/30 rounded-lg p-5">
    <h3 className="font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
      <span className="text-2xl">{index === 0 ? '⚔️' : index === 1 ? '🔮' : '🗡️'}</span>
      Companion {index + 1}
    </h3>
    
    <div className="space-y-4">
      {/* Name */}
      <div>
        <label className="block text-xs font-serif font-semibold text-stone-700 mb-2">
          Name
        </label>
        <input
          type="text"
          value={companion.name}
          onChange={(e) => {
            const newCompanions = [...companions];
            newCompanions[index].name = e.target.value;
            setCompanions(newCompanions);
          }}
          className="w-full bg-white border-2 border-stone-300 rounded px-3 py-2 font-serif text-sm"
        />
      </div>

      {/* Race */}
      <div>
        <label className="block text-xs font-serif font-semibold text-stone-700 mb-2">
          Race
        </label>
        <select
          value={companion.race}
          onChange={(e) => {
            const newCompanions = [...companions];
            newCompanions[index].race = e.target.value;
            setCompanions(newCompanions);
          }}
          className="w-full bg-white border-2 border-stone-300 rounded px-3 py-2 font-serif text-sm"
        >
          {RACES.map((r) => (
            <option key={`companion-${index}-race-${r}`} value={r}>
              {r}
            </option>
          ))}
        </select>
      </div>

      {/* Class */}
      <div>
        <label className="block text-xs font-serif font-semibold text-stone-700 mb-2">
          Class
        </label>
        <select
          value={companion.class}
          onChange={(e) => {
            const newCompanions = [...companions];
            newCompanions[index].class = e.target.value;
            setCompanions(newCompanions);
          }}
          className="w-full bg-white border-2 border-stone-300 rounded px-3 py-2 font-serif text-sm"
        >
          {CLASSES.map((c) => (
            <option key={`companion-${index}-class-${c}`} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {/* Personality */}
      <div>
        <label className="block text-xs font-serif font-semibold text-stone-700 mb-2">
          Personality (1-3 words)
        </label>
        <input
          type="text"
          value={companion.personality}
          onChange={(e) => {
            const newCompanions = [...companions];
            newCompanions[index].personality = e.target.value;
            setCompanions(newCompanions);
          }}
          placeholder="e.g., Brave & Loyal, Sarcastic, Wise"
          className="w-full bg-white border-2 border-stone-300 rounded px-3 py-2 font-serif text-sm"
        />
      </div>
    </div>
  </div>
))}

                </motion.div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={customizeCompanions && companions.some(c => !c.name || !c.personality)}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
                >
                  Next: Stat Allocation →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Stat Allocation Method */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">Choose Stat Allocation Method</h2>
              
              <div className="space-y-4 mb-8">
                <button
                  onClick={() => {
                    setAllocationMethod('pointbuy');
                    setStats({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 });
                    setPointsRemaining(27);
                  }}
                  className={`w-full p-6 rounded border-2 text-left transition ${
                    allocationMethod === 'pointbuy'
                      ? 'bg-amber-700 text-amber-50 border-amber-900'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                  }`}
                >
                  <div className="font-serif font-bold text-lg mb-2">✨ Point Buy (Recommended)</div>
                  <p className="text-sm font-serif opacity-90">
                    Spend 27 points to customize your stats. Balanced and strategic.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setAllocationMethod('standard');
                    setStats({ STR: 8, DEX: 8, CON: 8, INT: 8, WIS: 8, CHA: 8 });
                    setStandardArrayValues([...STANDARD_ARRAY]);
                    setStandardArrayAssigned({ STR: null, DEX: null, CON: null, INT: null, WIS: null, CHA: null });
                  }}
                  className={`w-full p-6 rounded border-2 text-left transition ${
                    allocationMethod === 'standard'
                      ? 'bg-amber-700 text-amber-50 border-amber-900'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                  }`}
                >
                  <div className="font-serif font-bold text-lg mb-2">⚡ Standard Array (Quick)</div>
                  <p className="text-sm font-serif opacity-90">
                    Assign these values: 15, 14, 13, 12, 10, 8. Fast and simple.
                  </p>
                </button>

                <button
                  onClick={() => {
                    setAllocationMethod('roll');
                    rollDice();
                  }}
                  className={`w-full p-6 rounded border-2 text-left transition ${
                    allocationMethod === 'roll'
                      ? 'bg-amber-700 text-amber-50 border-amber-900'
                      : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                  }`}
                >
                  <div className="font-serif font-bold text-lg mb-2">🎲 Roll Dice (Classic)</div>
                  <p className="text-sm font-serif opacity-90">
                    Roll 4d6 and drop lowest. Traditional D&D method. Results may vary!
                  </p>
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1.5)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition"
                >
                  Next: Assign Stats →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Assign Stats */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                Assign Your Ability Scores
              </h2>

              {/* Point Buy Method */}
              {allocationMethod === 'pointbuy' && (
                <div>
                  <div className="mb-6 p-4 bg-amber-100 border-2 border-amber-800 rounded text-center">
                    <div className="text-3xl font-serif font-bold text-stone-900">{pointsRemaining}</div>
                    <div className="text-sm font-serif text-stone-700">Points Remaining</div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {Object.entries(stats).map(([ability, value]) => {
                      const modifier = Math.floor((value - 10) / 2);
                      return (
                        <div key={ability} className="bg-white/50 border-2 border-amber-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-serif font-bold text-amber-900 uppercase w-12">
                                {ability}
                              </div>
                              <div className="text-2xl font-serif font-bold text-stone-900">
                                {value}
                              </div>
                              <div className="text-sm font-serif text-stone-600">
                                ({modifier >= 0 ? '+' : ''}{modifier})
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => adjustStat(ability, -1)}
                                disabled={value <= 8}
                                className="w-10 h-10 bg-red-600 hover:bg-red-700 disabled:bg-stone-300 text-white font-bold rounded border-2 border-red-800 disabled:border-stone-400 transition"
                              >
                                -
                              </button>
                              <button
                                onClick={() => adjustStat(ability, 1)}
                                disabled={value >= 15 || pointsRemaining === 0}
                                className="w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-stone-300 text-white font-bold rounded border-2 border-green-800 disabled:border-stone-400 transition"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <div className="text-xs font-serif text-stone-600">
                            Cost: {POINT_BUY_COSTS[value]} points
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-blue-100 border border-blue-600 rounded text-xs font-serif text-blue-900">
                    <strong>Point Buy Rules:</strong> Start with 8 in each stat. Costs increase as stats get higher. Max is 15 before racial bonuses.
                  </div>
                </div>
              )}

              {/* Standard Array Method */}
              {allocationMethod === 'standard' && (
                <div>
                  <div className="mb-6 p-4 bg-amber-100 border-2 border-amber-800 rounded">
                    <div className="text-sm font-serif text-stone-700 mb-2 text-center">
                      Available values to assign:
                    </div>
                    <div className="flex justify-center gap-2 flex-wrap">
                      {standardArrayValues.map((val, idx) => (
                        <div key={idx} className="w-12 h-12 bg-white border-2 border-amber-900 rounded flex items-center justify-center font-serif font-bold text-stone-900">
                          {val}
                        </div>
                      ))}
                      {standardArrayValues.length === 0 && (
                        <span className="text-sm font-serif text-green-700 italic">All assigned! ✓</span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-4 mb-8">
                    {Object.entries(stats).map(([ability, value]) => {
                      const modifier = Math.floor((value - 10) / 2);
                      const assigned = standardArrayAssigned[ability];
                      return (
                        <div key={ability} className="bg-white/50 border-2 border-amber-900/20 rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="text-sm font-serif font-bold text-amber-900 uppercase w-12">
                                {ability}
                              </div>
                              {assigned !== null ? (
                                <>
                                  <div className="text-2xl font-serif font-bold text-stone-900">
                                    {assigned}
                                  </div>
                                  <div className="text-sm font-serif text-stone-600">
                                    ({modifier >= 0 ? '+' : ''}{modifier})
                                  </div>
                                  <span className="text-green-600 text-sm">✓</span>
                                </>
                              ) : (
                                <div className="text-stone-500 italic font-serif text-sm">Not assigned</div>
                              )}
                            </div>
                            <div className="flex gap-2 flex-wrap">
                              {standardArrayValues.map((val) => (
                                <button
                                  key={val}
                                  onClick={() => assignStandardArray(ability, val)}
                                  className="px-3 py-2 bg-amber-600 hover:bg-amber-700 text-white font-serif font-semibold rounded border-2 border-amber-800 transition"
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="p-4 bg-blue-100 border border-blue-600 rounded text-xs font-serif text-blue-900">
                    <strong>Standard Array:</strong> Click a value button to assign it to that ability. Each value can only be used once.
                  </div>
                </div>
              )}

              {/* Roll Dice Method */}
              {allocationMethod === 'roll' && (
                <div>
                  <div className="mb-6 text-center">
                    <button
                      onClick={rollDice}
                      className="bg-green-600 hover:bg-green-700 text-white font-serif font-bold py-3 px-8 rounded-lg border-2 border-green-800 transition shadow-lg"
                    >
                      🎲 Roll Again
                    </button>
                  </div>

                  {rolledStats.length > 0 && (
                    <>
                      <div className="mb-6 p-4 bg-amber-100 border-2 border-amber-800 rounded">
                        <div className="text-sm font-serif text-stone-700 mb-2 text-center">
                          Your rolled values (4d6, drop lowest):
                        </div>
                        <div className="flex justify-center gap-3">
                          {rolledStats.map((val, idx) => (
                            <motion.div
                              key={idx}
                              initial={{ scale: 0, rotate: -180 }}
                              animate={{ scale: 1, rotate: 0 }}
                              transition={{ delay: idx * 0.1 }}
                              className="w-14 h-14 bg-white border-2 border-amber-900 rounded flex items-center justify-center font-serif font-bold text-xl text-stone-900"
                            >
                              {val}
                            </motion.div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3 mb-8">
                        {Object.keys(stats).map((ability) => (
                          <div key={ability} className="bg-white/50 border-2 border-amber-900/20 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-serif font-bold text-amber-900 uppercase">
                                {ability}
                              </div>
                              <select
                                value={stats[ability as keyof typeof stats]}
                                onChange={(e) => setStats({ ...stats, [ability]: parseInt(e.target.value) })}
                                className="bg-white border-2 border-amber-900/30 rounded px-3 py-2 font-serif font-bold text-stone-900"
                              >
                                <option value={8}>8</option>
                                {rolledStats.map((val) => (
                                  <option key={val} value={val}>{val}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-4 bg-blue-100 border border-blue-600 rounded text-xs font-serif text-blue-900">
                        <strong>Rolled Stats:</strong> Assign your rolled values to any ability. You can use the same value multiple times if you wish!
                      </div>
                    </>
                  )}
                </div>
              )}

              <div className="flex gap-3 mt-8">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(4)}
                  disabled={
                    (allocationMethod === 'pointbuy' && pointsRemaining !== 0) ||
                    (allocationMethod === 'standard' && standardArrayValues.length !== 0) ||
                    (allocationMethod === 'roll' && rolledStats.length === 0)
                  }
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
                >
                  Next: Choose Skills →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Choose Skills */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                Choose Your Skills
              </h2>

              <div className="mb-6 p-4 bg-amber-100 border-2 border-amber-800 rounded text-center">
                <div className="text-3xl font-serif font-bold text-stone-900">
                  {selectedSkills.length} / {SKILL_COUNT[characterClass]}
                </div>
                <div className="text-sm font-serif text-stone-700">Skills Selected</div>
              </div>

              <div className="mb-4 p-4 bg-blue-100 border border-blue-600 rounded text-sm font-serif text-blue-900">
                <strong>Class: {characterClass}</strong> - Select {SKILL_COUNT[characterClass]} skill proficiencies. These will give you bonuses when performing related actions.
              </div>

              <div className="space-y-2 mb-8 max-h-96 overflow-y-auto">
                {CLASS_SKILLS[characterClass]?.map((skill) => {
                  const isSelected = selectedSkills.includes(skill);
                  return (
                    <button
                      key={skill}
                      onClick={() => toggleSkill(skill)}
                      disabled={!isSelected && selectedSkills.length >= SKILL_COUNT[characterClass]}
                      className={`w-full p-4 rounded border-2 text-left font-serif font-semibold transition ${
                        isSelected
                          ? 'bg-green-600 text-white border-green-800'
                          : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{skill}</span>
                        {isSelected && <span className="text-xl">✓</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(5)}
                  disabled={selectedSkills.length !== SKILL_COUNT[characterClass]}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
                >
                  Next: Choose Trait →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Choose Personality Trait */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                Choose Your Personality Trait
              </h2>

              <div className="mb-6 p-4 bg-blue-100 border border-blue-600 rounded text-sm font-serif text-blue-900">
                Your personality trait defines how your character typically behaves. The DM will incorporate this into the story and interactions.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {TRAITS.map((trait) => {
                  const isSelected = selectedTrait === trait.id;
                  return (
                    <motion.button
                      key={trait.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedTrait(trait.id)}
                      className={`p-5 rounded-lg border-2 text-left transition ${
                        isSelected
                          ? 'bg-amber-700 text-amber-50 border-amber-900 shadow-lg'
                          : 'bg-white text-stone-900 border-stone-300 hover:border-amber-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="font-serif font-bold text-lg">{trait.name}</div>
                        {isSelected && <span className="text-2xl">✓</span>}
                      </div>
                      <p className={`text-sm font-serif ${isSelected ? 'text-amber-100' : 'text-stone-600'}`}>
                        {trait.desc}
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(4)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(6)}
                  disabled={!selectedTrait}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
                >
                  Next: Choose Flaw →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 6: Choose Character Flaw */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                Choose Your Character Flaw
              </h2>

              <div className="mb-6 p-4 bg-red-100 border border-red-600 rounded text-sm font-serif text-red-900">
                <strong>⚠️ Flaws make your character interesting!</strong> Your flaw will create challenges and dramatic moments in the story. Choose wisely - it affects gameplay!
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {FLAWS.map((flaw) => {
                  const isSelected = selectedFlaw === flaw.id;
                  return (
                    <motion.button
                      key={flaw.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedFlaw(flaw.id)}
                      className={`p-5 rounded-lg border-2 text-left transition ${
                        isSelected
                          ? 'bg-red-700 text-red-50 border-red-900 shadow-lg'
                          : 'bg-white text-stone-900 border-stone-300 hover:border-red-700'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{flaw.emoji}</span>
                          <div className="font-serif font-bold text-lg">{flaw.name}</div>
                        </div>
                        {isSelected && <span className="text-2xl">✓</span>}
                      </div>
                      <p className={`text-sm font-serif ${isSelected ? 'text-red-100' : 'text-stone-600'}`}>
                        {flaw.desc}
                      </p>
                    </motion.button>
                  );
                })}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(5)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={() => setStep(7)}
                  disabled={!selectedFlaw}
                  className="flex-1 bg-amber-700 hover:bg-amber-800 disabled:bg-stone-400 text-amber-50 font-serif font-bold py-4 px-6 rounded border-2 border-amber-900 transition disabled:cursor-not-allowed"
                >
                  Next: Background →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 7: Background */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <h2 className="text-2xl font-serif font-bold text-stone-900 mb-6">
                Character Background
              </h2>

              <div className="mb-6 p-4 bg-purple-100 border border-purple-600 rounded text-sm font-serif text-purple-900">
                <strong>📜 Your Story:</strong> Write your character's backstory or let AI create one based on your choices. This helps the DM weave your character into the adventure.
              </div>

              <div className="flex gap-2 mb-3">
                <button
                  onClick={generateBackground}
                  disabled={generatingBackground}
                  className="bg-purple-600 hover:bg-purple-700 disabled:bg-stone-400 text-white font-serif font-bold px-6 py-3 rounded-lg border-2 border-purple-800 transition disabled:cursor-not-allowed shadow-lg"
                >
                  {generatingBackground ? '✨ Generating...' : '✨ AI Generate Background'}
                </button>
                <span className="text-sm font-serif text-stone-600 italic self-center">
                  or write your own below
                </span>
              </div>

              <textarea
                value={background}
                onChange={(e) => setBackground(e.target.value)}
                placeholder="Write your character's backstory... Who are they? Where are they from? What drives them to adventure?"
                rows={6}
                className="w-full bg-white border-2 border-amber-900/30 rounded-lg px-4 py-3 font-serif text-stone-900 focus:outline-none focus:border-amber-700 resize-none mb-6"
              />

              {background && (
                <div className="mb-6 p-4 bg-green-100 border-2 border-green-600 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">📜</span>
                    <div className="font-serif font-bold text-green-900">Your Character's Story</div>
                  </div>
                  <p className="text-sm font-serif text-green-800 leading-relaxed">
                    {background}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(6)}
                  className="flex-1 bg-stone-300 hover:bg-stone-400 text-stone-800 font-serif font-bold py-4 px-6 rounded border-2 border-stone-400 transition"
                >
                  ← Back
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 bg-green-700 hover:bg-green-800 text-green-50 font-serif font-bold py-4 px-6 rounded border-2 border-green-900 transition shadow-xl"
                >
                  ✓ Create Character!
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Background Approval Modal */}
      <AnimatePresence>
        {showBackgroundApproval && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowBackgroundApproval(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-amber-50 rounded-lg border-4 border-purple-600 p-8 max-w-2xl w-full shadow-2xl"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
              }}
            >
              <div className="text-center mb-4">
                <div className="text-5xl mb-2">✨</div>
                <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                  AI Generated Background
                </h3>
                <p className="text-sm font-serif text-stone-600 italic">
                  Review and approve or generate a new one
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
                  className="flex-1 bg-amber-600 hover:bg-amber-700 disabled:bg-stone-400 text-white font-serif font-bold py-3 px-6 rounded-lg border-2 border-amber-800 transition"
                >
                  🔄 Generate New One
                </button>
                <button
                  onClick={approveBackground}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-serif font-bold py-3 px-6 rounded-lg border-2 border-green-800 transition shadow-lg"
                >
                  ✓ Use This Background
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
