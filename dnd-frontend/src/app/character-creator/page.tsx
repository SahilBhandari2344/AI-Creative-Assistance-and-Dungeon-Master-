'use client';

import { useRouter } from 'next/navigation';
import EnhancedCharacterCreation from '@/src/components/EnhancedCharacterCreation';

export default function CharacterCreatorPage() {
  const router = useRouter();

  const handleCharacterComplete = (character: any) => {
    console.log('Character created:', character);
    localStorage.setItem('dnd-character', JSON.stringify(character));
    router.push('/adventure-select');  // Make sure this matches!
  };

  return <EnhancedCharacterCreation onComplete={handleCharacterComplete} />;
}
