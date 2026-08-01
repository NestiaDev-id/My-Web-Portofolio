import React, { useMemo } from 'react';

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

const Momoisay: React.FC<MomoisayProps> = ({ text = "Hello Sensei! Let's play some games!", className = "" }) => {
  const bubble = useMemo(() => generateBubble(text), [text]);

  return (
    <div className={`flex flex-col items-start ${className}`}>
      <pre className="font-mono text-sm leading-none whitespace-pre text-slate-100 drop-shadow-md">
        {bubble}
      </pre>
      <pre className="font-mono text-[10px] sm:text-xs leading-[1.1] whitespace-pre text-pink-500 drop-shadow-[0_0_5px_rgba(236,72,153,0.5)]">
        {MOMOI_ART}
      </pre>
    </div>
  );
};

export default Momoisay;
