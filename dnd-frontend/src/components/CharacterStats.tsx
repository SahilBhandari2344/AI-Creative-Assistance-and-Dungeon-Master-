'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Character } from '../types/character';

interface CharacterStatsProps {
  character: Character & {
    stats?: Record<string, number>;
    skills?: string[];
    flaw?: string;
    trait?: string;
    companions?: Array<{ name: string; race: string; class: string; personality: string }>;
  };
}

export default function CharacterStats({ character }: CharacterStatsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'stats' | 'inventory' | 'spells'>('stats');

  // Calculate ability modifiers
  const getModifier = (score: number) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  // Map skills to their ability scores
  const SKILL_ABILITIES: Record<string, keyof typeof stats> = {
    'Acrobatics': 'DEX',
    'Animal Handling': 'WIS',
    'Arcana': 'INT',
    'Athletics': 'STR',
    'Deception': 'CHA',
    'History': 'INT',
    'Insight': 'WIS',
    'Intimidation': 'CHA',
    'Investigation': 'INT',
    'Medicine': 'WIS',
    'Nature': 'INT',
    'Perception': 'WIS',
    'Performance': 'CHA',
    'Persuasion': 'CHA',
    'Religion': 'INT',
    'Sleight of Hand': 'DEX',
    'Stealth': 'DEX',
    'Survival': 'WIS',
  };

  // Use actual stats if available, otherwise generate based on class
  const getStats = () => {
    // If character has custom stats, use those
    if (character.stats) {
      return character.stats as { STR: number; DEX: number; CON: number; INT: number; WIS: number; CHA: number };
    }
    
    // Otherwise use default class-based stats
    const baseStats = { STR: 10, DEX: 10, CON: 10, INT: 10, WIS: 10, CHA: 10 };
    
    switch (character.class) {
      case 'Fighter':
        return { ...baseStats, STR: 16, CON: 14, DEX: 12 };
      case 'Wizard':
        return { ...baseStats, INT: 16, DEX: 12, CON: 12 };
      case 'Rogue':
        return { ...baseStats, DEX: 16, INT: 12, CHA: 12 };
      case 'Cleric':
        return { ...baseStats, WIS: 16, CON: 14, STR: 12 };
      case 'Ranger':
        return { ...baseStats, DEX: 16, WIS: 14, CON: 12 };
      case 'Paladin':
        return { ...baseStats, STR: 16, CHA: 14, CON: 12 };
      default:
        return baseStats;
    }
  };

  const stats = getStats();

  // Calculate HP based on class and constitution
  const getMaxHP = () => {
    const conMod = Math.floor((stats.CON - 10) / 2);
    const baseHP: Record<string, number> = {
      Fighter: 10,
      Wizard: 6,
      Rogue: 8,
      Cleric: 8,
      Ranger: 10,
      Paladin: 10,
    };
    return (baseHP[character.class as keyof typeof baseHP] || 8) + conMod;
  };

  // Get proficient skills for character - use actual selected skills if available
  const proficientSkills = character.skills || CLASS_PROFICIENCIES[character.class as keyof typeof CLASS_PROFICIENCIES] || [];

  const CLASS_PROFICIENCIES: Record<string, string[]> = {
    Fighter: ['Athletics', 'Intimidation'],
    Wizard: ['Arcana', 'History'],
    Rogue: ['Stealth', 'Sleight of Hand', 'Deception', 'Acrobatics'],
    Cleric: ['Medicine', 'Religion'],
    Ranger: ['Nature', 'Survival', 'Perception'],
    Paladin: ['Athletics', 'Persuasion'],
  };

  // Calculate skill bonus
  const getSkillBonus = (skill: string) => {
    const ability = SKILL_ABILITIES[skill];
    const abilityMod = Math.floor((stats[ability] - 10) / 2);
    const proficiencyBonus = 2; // Level 1 proficiency
    const isProficient = proficientSkills.includes(skill);
    const bonus = isProficient ? abilityMod + proficiencyBonus : abilityMod;
    return bonus >= 0 ? `+${bonus}` : `${bonus}`;
  };

  // Get equipment based on class
  const getEquipment = () => {
    const equipment: Record<string, string[]> = {
      Fighter: ['Longsword', 'Shield', 'Chain Mail', 'Backpack', 'Bedroll', '50 gold'],
      Wizard: ['Quarterstaff', 'Spellbook', 'Component Pouch', 'Robes', 'Backpack', '30 gold'],
      Rogue: ['Shortsword', 'Dagger', 'Thieves\' Tools', 'Leather Armor', 'Backpack', '40 gold'],
      Cleric: ['Mace', 'Shield', 'Holy Symbol', 'Chain Mail', 'Backpack', '25 gold'],
      Ranger: ['Longbow', 'Quiver (20 arrows)', 'Shortsword', 'Leather Armor', 'Backpack', '35 gold'],
      Paladin: ['Longsword', 'Shield', 'Holy Symbol', 'Chain Mail', 'Backpack', '30 gold'],
    };
    return equipment[character.class as keyof typeof equipment] || ['Basic equipment'];
  };

  // Get spells/abilities based on class
  const getSpellsOrAbilities = () => {
    const abilities: Record<string, Array<{ name: string; desc: string }>> = {
      Fighter: [
        { name: 'Second Wind', desc: 'Regain 1d10 + level HP as a bonus action' },
        { name: 'Fighting Style', desc: 'Choose a combat specialization' },
      ],
      Wizard: [
        { name: 'Cantrips', desc: 'Fire Bolt, Mage Hand, Prestidigitation' },
        { name: 'Spells', desc: 'Magic Missile, Shield, Detect Magic, Identify' },
        { name: 'Arcane Recovery', desc: 'Recover spell slots on short rest' },
      ],
      Rogue: [
        { name: 'Sneak Attack', desc: '1d6 extra damage with advantage' },
        { name: 'Cunning Action', desc: 'Bonus action Dash, Disengage, or Hide' },
        { name: 'Thieves\' Cant', desc: 'Secret language of rogues' },
      ],
      Cleric: [
        { name: 'Cantrips', desc: 'Sacred Flame, Guidance, Thaumaturgy' },
        { name: 'Spells', desc: 'Cure Wounds, Bless, Shield of Faith, Healing Word' },
        { name: 'Divine Domain', desc: 'Special powers from your deity' },
      ],
      Ranger: [
        { name: 'Favored Enemy', desc: 'Bonus against chosen enemy type' },
        { name: 'Natural Explorer', desc: 'Expertise in chosen terrain' },
        { name: 'Spells', desc: 'Hunters Mark, Cure Wounds (at level 2)' },
      ],
      Paladin: [
        { name: 'Divine Sense', desc: 'Detect celestials, fiends, undead' },
        { name: 'Lay on Hands', desc: 'Heal 5 HP per level as an action' },
        { name: 'Spells', desc: 'Bless, Divine Favor, Shield of Faith (at level 2)' },
      ],
    };
    return abilities[character.class as keyof typeof abilities] || [];
  };

  return (
    <>
      {/* Floating Character Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 bg-amber-700 hover:bg-amber-800 text-amber-50 font-serif font-bold py-3 px-4 rounded-lg border-2 border-amber-900 shadow-xl transition flex items-center gap-2"
      >
        <span className="text-xl">📜</span>
        <span className="hidden sm:inline">Character</span>
      </button>

      {/* Character Sheet Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: -400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-full sm:w-96 bg-amber-50 shadow-2xl z-50 overflow-hidden flex flex-col border-r-4 border-amber-900/30"
              style={{ 
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulance type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
              }}
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-amber-800 to-amber-700 p-6 border-b-4 border-amber-900/40">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h2 className="text-2xl font-serif font-bold text-amber-50">{character.name}</h2>
                    <p className="text-amber-200 text-sm font-serif">
                      Level {character.level} {character.race} {character.class}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-amber-200 hover:text-amber-50 text-2xl leading-none"
                  >
                    ×
                  </button>
                </div>

                {/* HP Bar */}
                <div className="bg-amber-950/50 rounded p-3 border border-amber-900">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-amber-100 text-xs font-serif font-semibold uppercase">Hit Points</span>
                    <span className="text-amber-100 text-sm font-serif font-bold">{getMaxHP()}/{getMaxHP()}</span>
                  </div>
                  <div className="bg-amber-950 rounded-full h-2 overflow-hidden">
                    <div className="bg-red-600 h-full" style={{ width: '100%' }} />
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex border-b-2 border-amber-900/20 bg-amber-100/50">
                <button
                  onClick={() => setActiveTab('stats')}
                  className={`flex-1 py-3 font-serif font-semibold text-sm transition ${
                    activeTab === 'stats'
                      ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-700'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Stats
                </button>
                <button
                  onClick={() => setActiveTab('inventory')}
                  className={`flex-1 py-3 font-serif font-semibold text-sm transition ${
                    activeTab === 'inventory'
                      ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-700'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Inventory
                </button>
                <button
                  onClick={() => setActiveTab('spells')}
                  className={`flex-1 py-3 font-serif font-semibold text-sm transition ${
                    activeTab === 'spells'
                      ? 'bg-amber-50 text-amber-900 border-b-2 border-amber-700'
                      : 'text-stone-600 hover:text-stone-900'
                  }`}
                >
                  Abilities
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* Stats Tab */}
                {activeTab === 'stats' && (
                  <div>
                    {/* Ability Scores */}
                    <div className="mb-6">
                      <h4 className="text-sm font-serif font-bold text-stone-900 uppercase mb-3 border-b border-stone-300 pb-1">
                        Ability Scores
                      </h4>
                      <div className="grid grid-cols-3 gap-3">
                        {Object.entries(stats).map(([ability, score]) => (
                          <div
                            key={ability}
                            className="bg-white border-2 border-amber-900/30 rounded-lg p-3 text-center"
                          >
                            <div className="text-xs font-serif font-bold text-amber-900 uppercase mb-1">
                              {ability}
                            </div>
                            <div className="text-2xl font-serif font-bold text-stone-900">{score}</div>
                            <div className="text-sm font-serif text-stone-600">{getModifier(score)}</div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Skills */}
                    <div className="mb-6">
                      <h4 className="text-sm font-serif font-bold text-stone-900 uppercase mb-3 border-b border-stone-300 pb-1">
                        Skills
                      </h4>
                      <div className="space-y-1">
                        {Object.keys(SKILL_ABILITIES).map((skill) => {
                          const isProficient = proficientSkills.includes(skill);
                          return (
                            <div
                              key={skill}
                              className={`flex justify-between items-center text-xs font-serif py-1 px-2 rounded ${
                                isProficient ? 'bg-green-100 font-semibold' : ''
                              }`}
                            >
                              <span className={isProficient ? 'text-green-900' : 'text-stone-700'}>
                                {isProficient && '✓ '}{skill}
                              </span>
                              <span className={isProficient ? 'text-green-900' : 'text-stone-600'}>
                                {getSkillBonus(skill)}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                      <p className="text-xs font-serif text-stone-500 italic mt-2">
                        ✓ = Proficient (includes +2 bonus)
                      </p>
                    </div>

                    {/* Personality & Flaw */}
                    {(character.trait || character.flaw) && (
                      <div className="mb-4">
                        <h5 className="text-xs font-serif font-semibold text-stone-700 uppercase mb-2 border-b border-stone-300 pb-1">
                          Personality
                        </h5>
                        <div className="space-y-2">
                          {character.trait && (
                            <div className="flex items-start gap-2 text-xs font-serif text-stone-700 bg-blue-100 rounded px-3 py-2 border border-blue-600">
                              <span className="text-lg">⭐</span>
                              <div>
                                <div className="font-bold text-blue-900">Trait:</div>
                                <div className="capitalize">{character.trait}</div>
                              </div>
                            </div>
                          )}
                          {character.flaw && (
                            <div className="flex items-start gap-2 text-xs font-serif text-stone-700 bg-red-100 rounded px-3 py-2 border border-red-600">
                              <span className="text-lg">⚠️</span>
                              <div>
                                <div className="font-bold text-red-900">Flaw:</div>
                                <div className="capitalize">{character.flaw}</div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Companions */}
                    <div className="mb-4">
                      <h5 className="text-xs font-serif font-semibold text-stone-700 uppercase mb-2 border-b border-stone-300 pb-1">
                        Party Companions
                      </h5>
                      <div className="space-y-2">
                        {character.companions ? (
                          // Custom companions
                          character.companions.map((companion, idx) => (
                            <div key={idx} className="flex items-center gap-2 text-xs font-serif text-stone-700">
                              <span className="text-lg">
                                {companion.class === 'Fighter' ? '⚔️' : 
                                 companion.class === 'Wizard' ? '🔮' : 
                                 companion.class === 'Rogue' ? '🗡️' : 
                                 companion.class === 'Cleric' ? '✝️' :
                                 companion.class === 'Ranger' ? '🏹' : '🛡️'}
                              </span>
                              <div>
                                <span className="font-bold">{companion.name}</span>
                                <span className="text-stone-500"> • {companion.race} {companion.class}</span>
                                <div className="text-stone-500 italic text-[10px]">{companion.personality}</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          // Default companions fallback
                          <>
                            <div className="flex items-center gap-2 text-xs font-serif text-stone-700">
                              <span className="text-lg">⚔️</span>
                              <div>
                                <span className="font-bold">Thorin</span>
                                <span className="text-stone-500"> • Dwarf Fighter</span>
                                <div className="text-stone-500 italic text-[10px]">Brave & Protective</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-serif text-stone-700">
                              <span className="text-lg">🔮</span>
                              <div>
                                <span className="font-bold">Elena</span>
                                <span className="text-stone-500"> • Elf Wizard</span>
                                <div className="text-stone-500 italic text-[10px]">Cautious & Analytical</div>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-serif text-stone-700">
                              <span className="text-lg">🗡️</span>
                              <div>
                                <span className="font-bold">Finn</span>
                                <span className="text-stone-500"> • Halfling Rogue</span>
                                <div className="text-stone-500 italic text-[10px]">Cheeky & Impulsive</div>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Combat Stats */}
                    <div>
                      <h4 className="text-sm font-serif font-bold text-stone-900 uppercase mb-3 border-b border-stone-300 pb-1">
                        Combat
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="bg-white border border-amber-900/20 rounded p-3">
                          <div className="text-xs font-serif text-stone-600 mb-1">Armor Class</div>
                          <div className="text-xl font-serif font-bold text-stone-900">
                            {character.class === 'Wizard' ? 12 : character.class === 'Rogue' ? 14 : 16}
                          </div>
                        </div>
                        <div className="bg-white border border-amber-900/20 rounded p-3">
                          <div className="text-xs font-serif text-stone-600 mb-1">Initiative</div>
                          <div className="text-xl font-serif font-bold text-stone-900">
                            {getModifier(stats.DEX)}
                          </div>
                        </div>
                        <div className="bg-white border border-amber-900/20 rounded p-3">
                          <div className="text-xs font-serif text-stone-600 mb-1">Speed</div>
                          <div className="text-xl font-serif font-bold text-stone-900">30 ft</div>
                        </div>
                        <div className="bg-white border border-amber-900/20 rounded p-3">
                          <div className="text-xs font-serif text-stone-600 mb-1">Proficiency</div>
                          <div className="text-xl font-serif font-bold text-stone-900">+2</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Inventory Tab */}
                {activeTab === 'inventory' && (
                  <div>
                    <h4 className="text-sm font-serif font-bold text-stone-900 uppercase mb-3 border-b border-stone-300 pb-1">
                      Equipment
                    </h4>
                    <div className="space-y-2">
                      {getEquipment().map((item, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-amber-900/20 rounded p-3 font-serif text-sm text-stone-700 flex items-center gap-2"
                        >
                          <span className="text-amber-700">•</span>
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Abilities Tab */}
                {activeTab === 'spells' && (
                  <div>
                    <h4 className="text-sm font-serif font-bold text-stone-900 uppercase mb-3 border-b border-stone-300 pb-1">
                      {character.class === 'Fighter' || character.class === 'Rogue' ? 'Abilities' : 'Spells & Abilities'}
                    </h4>
                    <div className="space-y-3">
                      {getSpellsOrAbilities().map((ability, idx) => (
                        <div
                          key={idx}
                          className="bg-white border border-amber-900/20 rounded p-4"
                        >
                          <h5 className="font-serif font-bold text-stone-900 mb-1">{ability.name}</h5>
                          <p className="font-serif text-xs text-stone-600">{ability.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
