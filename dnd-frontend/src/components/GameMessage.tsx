import { motion } from 'framer-motion';
import DiceRoll from './DiceRoll';

interface GameMessageProps {
  role: 'user' | 'dm';
  content: string;
}

// Function to parse dice rolls from text
function parseDiceRolls(text: string) {
  // Matches patterns like "rolls 15", "rolled 20", "roll: 8", etc.
  const dicePattern = /(?:rolls?|rolled)\s*(?:a\s*)?(?:\d+\s*\+\s*)?(\d+)|(?:roll|rolled):\s*(\d+)/gi;
  const parts: Array<{ type: 'text' | 'dice', content: string, value?: number }> = [];
  let lastIndex = 0;
  let match;

  while ((match = dicePattern.exec(text)) !== null) {
    // Add text before the roll
    if (match.index > lastIndex) {
      parts.push({ 
        type: 'text', 
        content: text.substring(lastIndex, match.index) 
      });
    }

    // Add the dice roll
    const rollValue = parseInt(match[1] || match[2]);
    parts.push({ 
      type: 'dice', 
      content: match[0], 
      value: rollValue 
    });

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ 
      type: 'text', 
      content: text.substring(lastIndex) 
    });
  }

  return parts.length > 0 ? parts : [{ type: 'text' as const, content: text }];
}

export default function GameMessage({ role, content }: GameMessageProps) {
  const contentParts = parseDiceRolls(content);

  if (role === 'dm') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20, rotateX: -5 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex justify-start"
      >
        <div className="max-w-[90%] relative">
          {/* Paper shadow */}
          <div className="absolute inset-0 bg-black/20 blur-md translate-y-1 rounded-lg" />
          
          {/* Main parchment */}
          <div className="relative bg-amber-50 rounded-lg p-6 border-2 border-amber-900/30 shadow-xl"
               style={{ 
                 backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.03'/%3E%3C/svg%3E")`,
               }}>
            
            {/* Top decoration bar */}
            <div className="flex items-center gap-3 mb-3 pb-3 border-b-2 border-amber-900/20">
              <div className="w-8 h-8 bg-amber-800 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-amber-50 text-sm">🎲</span>
              </div>
              <div>
                <div className="text-xs font-serif font-bold text-amber-900 uppercase tracking-widest">
                  Dungeon Master
                </div>
                <div className="text-[10px] font-serif text-stone-600 italic">
                  Narrating the tale
                </div>
              </div>
            </div>
            
            {/* Message content with dice rolls */}
            <div className="text-stone-800 font-serif text-[15px] leading-relaxed">
              {contentParts.map((part, idx) => (
                <span key={idx}>
                  {part.type === 'text' ? (
                    part.content
                  ) : (
                    <DiceRoll value={part.value!} />
                  )}
                </span>
              ))}
            </div>
            
            {/* Decorative corners */}
            <div className="absolute -bottom-1 -left-1 w-4 h-4 border-l-2 border-b-2 border-amber-900/40 rounded-bl" />
            <div className="absolute -top-1 -right-1 w-4 h-4 border-r-2 border-t-2 border-amber-900/40 rounded-tr" />
            
            {/* Aged paper effect on edge */}
            <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-amber-100 to-transparent opacity-50 rounded-tr-lg pointer-events-none" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Player messages
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, rotateX: 5 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex justify-end"
    >
      <div className="max-w-[75%] relative">
        {/* Note shadow */}
        <div className="absolute inset-0 bg-black/15 blur-sm translate-y-1 rounded-lg" />
        
        {/* Sticky note style */}
        <div className="relative bg-gradient-to-br from-blue-100 via-blue-50 to-blue-100/80 rounded-lg p-4 border-l-4 border-blue-400 shadow-lg">
          {/* Tape effect on top */}
          <div className="absolute -top-2 right-8 w-16 h-4 bg-amber-200/40 border border-amber-300/30 rounded-sm shadow-sm" />
          
          <div className="text-[11px] font-serif font-semibold text-blue-900 mb-2 uppercase tracking-wider opacity-60">
            Your Action
          </div>
          <div className="text-stone-900 font-serif text-[15px] whitespace-pre-wrap leading-relaxed">
            {content}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
