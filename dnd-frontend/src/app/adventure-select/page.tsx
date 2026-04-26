'use client';

import { useRouter } from 'next/navigation';
import AdventureSelection from '@/src/components/AdventureSelection';
import { Adventure } from '@/src/types/adventure';

export default function AdventureSelectPage() {
  const router = useRouter();

  const handleAdventureSelect = (adventure: Adventure) => {
    console.log('Adventure selected:', adventure);
    // Save selected adventure to localStorage
    localStorage.setItem('dnd-selected-adventure', JSON.stringify(adventure));
    // Navigate to game
    router.push('/game');
  };

  return <AdventureSelection onSelect={handleAdventureSelect} />;
}
