import React from 'react';

interface RansomNoteProps {
  text: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

const FONTS = ['font-p5-display', 'font-typewriter', 'font-heavy-block', 'font-marker', 'font-bungee'];
const TILTS = ['-rotate-6', '-rotate-3', '-rotate-1', 'rotate-0', 'rotate-1', 'rotate-3', 'rotate-6'];
const THEMES = [
  'bg-black text-white border-2 border-white',
  'bg-white text-black border-2 border-black',
  'bg-p5-red text-white border-2 border-black',
  'bg-slate-200 text-black border-2 border-black',
  'bg-black text-p5-red border-2 border-p5-red',
];

// Simple deterministic hash to keep styles consistent across renders
const getHash = (str: string, index: number) => {
  let hash = 0;
  const target = str + index.toString();
  for (let i = 0; i < target.length; i++) {
    hash = target.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

export default function RansomNote({ text, className = '', size = 'md' }: RansomNoteProps) {
  const words = text.split(' ');

  const sizeClasses = {
    sm: 'text-xs md:text-sm px-1 py-0 mx-[1px]',
    md: 'text-xl md:text-3xl px-1.5 py-1 mx-[2px]',
    lg: 'text-3xl md:text-5xl px-2 py-1 mx-[3px]',
    xl: 'text-5xl md:text-7xl px-3 py-1.5 mx-[4px]'
  };

  return (
    <div className={`flex flex-wrap items-center justify-center gap-y-3 gap-x-3 md:gap-y-5 md:gap-x-4 ${className}`}>
      {words.map((word, wIdx) => (
        <div key={wIdx} className="flex flex-wrap">
          {word.split('').map((char, cIdx) => {
            const h = getHash(char, wIdx * 100 + cIdx);
            const font = FONTS[h % FONTS.length];
            const theme = THEMES[h % THEMES.length];
            
            // Randomize vertical offset slightly
            const yOffset = (h % 5) - 2; // -2 to +2
            const rotate = (h % 12) - 6; // -6 to +6

            return (
              <span
                key={cIdx}
                className={`inline-block ${font} ${theme} ${sizeClasses[size]} uppercase shadow-md transition-transform hover:scale-110 cursor-crosshair`}
                style={{ 
                  transform: `translateY(${yOffset}px) rotate(${rotate}deg)`,
                  lineHeight: 1.1
                }}
              >
                {char}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
