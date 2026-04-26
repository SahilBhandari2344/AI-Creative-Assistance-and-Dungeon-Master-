export interface Adventure {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  estimatedTime: string;
  tags: string[];
  prompt: string;
  code?: string; // Share code for custom adventures
  custom?: boolean; // Flag to identify custom adventures
  encounters?: Encounter[]; // Custom encounter data
  npcs?: NPC[]; // Custom NPC data
}

export interface Encounter {
  id: string;
  name: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Deadly';
  enemies: string[];
}

export interface NPC {
  id: string;
  name: string;
  role: string;
  personality: string;
  appearance: string;
}

export const ADVENTURES: Adventure[] = [
  {
    id: 'haunted-inn',
    title: 'The Haunted Inn',
    description: 'A mysterious abandoned inn on a stormy night holds dark secrets. Investigate strange noises and ghostly apparitions.',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    tags: ['Mystery', 'Undead', 'Investigation'],
    prompt: 'Start with the party arriving at a mysterious abandoned inn on a stormy night. The inn appears deserted but there are signs of recent activity. Strange noises come from upstairs.',
  },
  {
    id: 'goblin-raid',
    title: 'Goblin Raid',
    description: 'A nearby village is under attack by goblins. Track them to their hideout and stop the raids.',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    tags: ['Combat', 'Rescue', 'Exploration'],
    prompt: 'Start with the party in a small village that has just been raided by goblins. The villagers are desperate for help. Tracks lead into the nearby forest.',
  },
  {
    id: 'dragon-cult',
    title: 'Rise of the Dragon Cult',
    description: 'Cultists are gathering power to summon an ancient dragon. Infiltrate their stronghold and stop the ritual.',
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    tags: ['Dragons', 'Cultists', 'High Stakes'],
    prompt: 'Start with the party discovering rumors of a dragon cult gathering in an old fortress. They must investigate and stop a dangerous summoning ritual.',
  },
  {
    id: 'missing-merchant',
    title: 'The Missing Merchant',
    description: 'A wealthy merchant has vanished along the trade road. Follow the clues to uncover a conspiracy.',
    difficulty: 'Beginner',
    estimatedTime: '1-2 hours',
    tags: ['Mystery', 'Investigation', 'Intrigue'],
    prompt: 'Start with the party being hired to find a missing merchant. His caravan was found abandoned on the road with no signs of struggle, but valuables left behind.',
  },
  {
    id: 'dungeon-delve',
    title: 'The Depths of Khazad',
    description: 'Ancient dwarven ruins hold legendary treasure, but the depths are filled with dangers.',
    difficulty: 'Intermediate',
    estimatedTime: '2-3 hours',
    tags: ['Dungeon Crawl', 'Treasure', 'Traps'],
    prompt: 'Start with the party at the entrance of ancient dwarven ruins. They have a map showing three levels deep, with rumors of a legendary artifact at the bottom.',
  },
  {
    id: 'sandbox',
    title: 'Open World Adventure',
    description: 'Create your own adventure! Start in a fantasy town and explore wherever your choices lead.',
    difficulty: 'Advanced',
    estimatedTime: 'Unlimited',
    tags: ['Sandbox', 'Open World', 'Player-Driven'],
    prompt: 'Start with the party arriving at a bustling fantasy town called Crossroads. Let the player guide the adventure. Be ready to generate quests, NPCs, and locations based on their choices.',
  },
];
