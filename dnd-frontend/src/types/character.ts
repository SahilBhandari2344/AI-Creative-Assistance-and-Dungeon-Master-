export interface Character {
  name: string;
  race: Race;
  class: Class;
  level: number;
}

export type Race = 'Human' | 'Elf' | 'Dwarf' | 'Halfling' | 'Dragonborn' | 'Tiefling';
export type Class = 'Fighter' | 'Wizard' | 'Rogue' | 'Cleric' | 'Ranger' | 'Paladin';

export const RACES: { name: Race; description: string }[] = [
  { name: 'Human', description: 'Versatile and ambitious' },
  { name: 'Elf', description: 'Graceful and long-lived' },
  { name: 'Dwarf', description: 'Sturdy and resilient' },
  { name: 'Halfling', description: 'Small and lucky' },
  { name: 'Dragonborn', description: 'Draconic heritage and breath weapon' },
  { name: 'Tiefling', description: 'Infernal bloodline and cunning' },
];

export const CLASSES: { name: Class; description: string }[] = [
  { name: 'Fighter', description: 'Master of martial combat' },
  { name: 'Wizard', description: 'Scholar of arcane magic' },
  { name: 'Rogue', description: 'Skilled in stealth and precision' },
  { name: 'Cleric', description: 'Divine spellcaster and healer' },
  { name: 'Ranger', description: 'Wilderness warrior and tracker' },
  { name: 'Paladin', description: 'Holy warrior bound by oath' },
];
