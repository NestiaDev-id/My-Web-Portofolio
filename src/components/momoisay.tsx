import React, { useMemo, useState, useEffect } from 'react';
import momoiFrames from './momoiFrames.json';

const MOMOI_ART = [
  " ⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢀⣤⣾⡿⠿⢿⣦⡀⠀⠀⠀⠀⠀⠀ ",
  "⠀⠀⢀⣶⣿⣶⣶⣶⣦⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣰⣿⠟⠁⣀⣤⡄ ⢹⣷⡀⠀⠀⠀⠀⠀ ",
  "⠀⠀⢸⣿⡧⠤⠤⣌⣉⣩⣿⡿⠶⠶⠒⠛⠛⠻⠿⠶⣾⣿⣣⠔⠉⠀⠀⠙⡆ ⢻⣷⠀⠀⠀⠀⠀ ",
  "⠀⠀⢸⣿⠀⠀⢠⣾⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣾⣿⡃⠀⠀⠀⠀⠀⢻ ⠘⣿⡀⠀⠀⠀⠀ ",
  "⠀⠀⠘⣿⡀⣴⠟⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠉⠛⠻⢶⣤⣀⠀⢘ ⠀⣿⡇⠀⠀⠀⠀ ",
  "⠀⠀⠀⢿⣿⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠈⠉⠛⢿ ⣴⣿⠀⠀⠀⠀⠀ ",
  "⠀⠀⠀⣸⡟⠀⠀⠀⣴⡆⠀⠀⠀⠀⠀⠀⠀⣷⡀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠻⣷⡀⠀⠀⠀⠀ ",
  "⠀⠀⢰⣿⠁⠀⠀⣰⠿⣇⠀⠀⠀⠀⠀⠀⠀⢻⣷⡀⠀⢠⡄⠀⠀⠀⠀⠀⡀⠀⠹⣷⠀⠀⠀⠀ ",
  "⠀⠀⣾⡏⠀⢀⣴⣿⣤⢿⡄⠀⠀⠀⠀⠀⠀⠸⣿⣷⡀⠘⣧⠀⠀⠀⠀⠀⣷⣄⠀⢻⣇⠀⠀⠀ ",
  "⠀⠀⢻⣇⠀⢸⡇⠀⠀⠀⢻⣄⠀⠀⠀⠀⠀⣤⡯⠈⢻⣄⢻⡄⠀⠀⠀⠀⣿⡿⣷⡌⣿⡄⠀⠀ ",
  "⠀⢀⣸⣿⠀⢸⡇⣶⣶⡄⠀⠙⠛⠛⠛⠛⠛⠃⣠⣶⣄⠙⠿⣧⠀⠀⠀⢠⣿⢹⣻⡇⠸⣿⡄⠀ ",
  "⢰⣿⢟⣿⡴⠞⠀⠘⢿⡿⠀⠀⠀⠀⠀⠀⠀⠀⠈⠻⣿⡇⠀⣿⡀⢀⣴⠿⣿⣦⣿⠃⠀⢹⣷⠀ ",
  "⠀⢿⣿⠁⠀⠀⠀⠀⠀⠀⠀⢠⣀⣀⡀⠀⡀⠀⠀⠀⠀⠀⠀⣿⠛⠛⠁⠀⣿⡟⠁⠀⠀⢀⣿   ",
  "⠀ ⠛⢷⣤⣀⠀⠀⠀⠀⠀⠀⠉⠉⠉⠛⠉⠀⠀⠀⠀⠀⢠⡿⢰⡟⠻⠞⠛⣧⣠⣦⣀⣾⠏⠀ ",
  "⠀  ⠀⠈⠛⠛⠶⢶⣤⣤⣤⣤⣤⣤⣤⣤⣶⠶⠶⠛⠛⠛⠷⢾⣧⣠⡿⢿⡟⠋⠛⠋⠁⠀⠀ "
].join('\n');

export interface MomoisayProps {
  text?: string;
  className?: string;
  animated?: boolean;
}

const generateBubble = (text: string) => {
  if (!text) return "";
  const lines = text.split('\n');
  const maxLength = Math.max(...lines.map(l => l.length));
  
  const top = ` ${'_'.repeat(maxLength + 2)}`;
  const bottom = ` ${'-'.repeat(maxLength + 2)}`;
  
  let body = "";
  if (lines.length === 1) {
    body = `< ${lines[0]} >\n`;
  } else {
    lines.forEach((line, i) => {
      const padded = line.padEnd(maxLength, ' ');
      if (i === 0) body += `/ ${padded} \\\n`;
      else if (i === lines.length - 1) body += `\\ ${padded} /\n`;
      else body += `| ${padded} |\n`;
    });
  }
  
  // The tail points down and right towards Momoi
  return `${top}\n${body}${bottom}\n   \\\n    \\\n`;
};

const ANIM_CONFIGS = {
  v1: {
    rep_frame: -1, rep_min: 0, rep_max: 0,
    rounds_min: 3, rounds_max: 5,
    getNext: () => 'v3' as const
  },
  v2: {
    rep_frame: 1, rep_min: 5, rep_max: 13,
    rounds_min: 1, rounds_max: 3,
    getNext: () => (Math.random() > 0.5 ? 'v1' : 'v3') as const
  },
  v3: {
    rep_frame: -1, rep_min: 0, rep_max: 0,
    rounds_min: 3, rounds_max: 5,
    getNext: () => 'v2' as const
  }
};

const randBetween = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

const Momoisay: React.FC<MomoisayProps> = ({ text = "Hello Sensei! Let's play some games!", className = "", animated = true }) => {
  const bubble = useMemo(() => generateBubble(text), [text]);

  const [animState, setAnimState] = useState({
    version: 'v1' as 'v1' | 'v2' | 'v3',
    frameIndex: 0,
    roundsLeft: randBetween(ANIM_CONFIGS.v1.rounds_min, ANIM_CONFIGS.v1.rounds_max),
    replap: ANIM_CONFIGS.v1.rep_frame >= 0 ? randBetween(ANIM_CONFIGS.v1.rep_min, ANIM_CONFIGS.v1.rep_max) : 0
  });

  useEffect(() => {
    if (!animated || !momoiFrames || !momoiFrames[animState.version]) return;
    
    // Type assertion for momoiFrames
    const framesData = (momoiFrames as any)[animState.version];
    const config = ANIM_CONFIGS[animState.version];
    const intervalMs = framesData.intervals[animState.frameIndex];
    
    const timer = setTimeout(() => {
      setAnimState(prev => {
        let nextFrameIndex = prev.frameIndex;
        let nextReplap = prev.replap;
        let nextRoundsLeft = prev.roundsLeft;
        let nextVersion = prev.version;
        let nextConfig = config;

        // Process frame advancement based on loop policy
        if (config.rep_frame >= 0 && nextFrameIndex === config.rep_frame) {
          if (nextReplap === 0) {
            nextReplap = randBetween(config.rep_min, config.rep_max);
            nextFrameIndex++;
          } else {
            nextFrameIndex = 0;
            nextReplap--;
          }
        } else {
          nextFrameIndex++;
        }

        // Check if outer round finished
        if (nextFrameIndex >= framesData.frames.length) {
          nextFrameIndex = 0;
          nextRoundsLeft--;

          // Check if we need to switch versions
          if (nextRoundsLeft <= 0) {
            nextVersion = config.getNext();
            nextConfig = ANIM_CONFIGS[nextVersion];
            nextRoundsLeft = randBetween(nextConfig.rounds_min, nextConfig.rounds_max);
            nextReplap = nextConfig.rep_frame >= 0 ? randBetween(nextConfig.rep_min, nextConfig.rep_max) : 0;
          }
        }

        return {
          version: nextVersion,
          frameIndex: nextFrameIndex,
          roundsLeft: nextRoundsLeft,
          replap: nextReplap
        };
      });
    }, intervalMs);
    
    return () => clearTimeout(timer);
  }, [animState, animated]);

  let currentArt = MOMOI_ART;
  if (animated && momoiFrames && (momoiFrames as any)[animState.version]) {
    currentArt = (momoiFrames as any)[animState.version].frames[animState.frameIndex];
  }

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <pre className="font-mono text-sm leading-none whitespace-pre text-slate-100 drop-shadow-md">
        {bubble}
      </pre>
      <pre className="font-mono text-[10px] sm:text-xs leading-[1.1] whitespace-pre text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
        {currentArt}
      </pre>
    </div>
  );
};

export default Momoisay;
