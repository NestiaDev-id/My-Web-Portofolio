import React from 'react';
import { Ghost, Skull, Asterisk, Hexagon, Cat, Star, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const SquiggleDecorations: React.FC = () => {
  return (
    <>
      {/* Invisible SVG Filter for the squigglevision (boiling lines) effect */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }} aria-hidden="true">
        <filter id="squiggle-noise">
          <feTurbulence baseFrequency="0.02" numOctaves="3" result="noise" seed="0">
            <animate 
              attributeName="seed" 
              values="1;2;3;4;5" 
              dur="0.6s" 
              calcMode="discrete" 
              repeatCount="indefinite" 
            />
          </feTurbulence>
          <feDisplacementMap 
            in="SourceGraphic" 
            in2="noise" 
            scale="3" 
            xChannelSelector="R" 
            yChannelSelector="G" 
          />
        </filter>
      </svg>

      <div 
        className="absolute inset-0 pointer-events-none z-0 overflow-hidden mix-blend-multiply"
        style={{ filter: "url('#squiggle-noise')" }}
      >
        {/* Bintang / Stars */}
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[5%] left-[5%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Star className="text-red-500 w-16 h-16 opacity-30 animate-pulse -rotate-12" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[25%] right-[8%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Star className="text-black w-24 h-24 opacity-10 -rotate-45" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[85%] left-[15%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Star className="text-yellow-500 w-20 h-20 opacity-30 rotate-12" /></motion.div>
        
        {/* Ikon Kucing (Morgana/Beruang) & Tengkorak & Hantu (Phantom) */}
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[12%] right-[15%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Cat className="text-black w-32 h-32 opacity-[0.05] rotate-[20deg]" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[45%] left-[5%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Ghost className="text-red-600 w-48 h-48 opacity-[0.05] rotate-[-15deg]" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[75%] right-[10%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Skull className="text-black w-40 h-40 opacity-[0.05] rotate-[25deg]" /></motion.div>
        
        {/* Elemen Geometris & Komik (Zap, Hexagon, Asterisk) */}
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[35%] left-[20%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Zap className="text-yellow-500 w-20 h-20 opacity-40 rotate-[15deg]" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[65%] right-[25%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Zap className="text-red-500 w-16 h-16 opacity-40 rotate-[-10deg]" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[18%] left-[25%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Hexagon className="text-blue-500 w-12 h-12 opacity-30" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[55%] right-[20%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Hexagon className="text-gray-500 w-16 h-16 opacity-30 rotate-45" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[50%] left-[30%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Asterisk className="text-black w-14 h-14 opacity-20 rotate-45" /></motion.div>
        <motion.div drag whileDrag={{ scale: 1.1 }} className="absolute top-[90%] right-[30%] pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit"><Asterisk className="text-red-600 w-24 h-24 opacity-20 rotate-90" /></motion.div>
        
        {/* Emoji Stiker Tambahan (Gaya Noto Emoji Outline) */}
        <style>
          {`
            @import url('https://fonts.googleapis.com/css2?family=Noto+Emoji:wght@300..700&display=swap');
            .noto-emoji { font-family: 'Noto Emoji', sans-serif; font-weight: 500; }
          `}
        </style>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute top-[32%] left-[8%] text-6xl -rotate-12 select-none noto-emoji opacity-80 pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: '#f35436' }}>🧙</motion.div>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute top-[26%] left-[6%] text-3xl rotate-12 select-none noto-emoji opacity-80 pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: '#3364e6' }}>🪄</motion.div>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute top-[15%] left-[40%] text-5xl select-none noto-emoji opacity-70 pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: '#fff1a7' }}>✨</motion.div>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute top-[85%] left-[8%] text-5xl -rotate-6 select-none noto-emoji opacity-80 pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: 'gold' }}>🍰</motion.div>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute top-[88%] right-[8%] text-4xl rotate-12 select-none noto-emoji opacity-80 pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: 'sienna' }}>🍮</motion.div>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute top-[35%] right-[10%] text-2xl rotate-12 select-none noto-emoji opacity-70 flex flex-col gap-1 pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: '#8576e4' }}>
          <span>💛</span><span>💛</span><span>💛</span>
        </motion.div>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute top-[8%] right-[15%] text-5xl rotate-[15deg] select-none noto-emoji opacity-80 pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: 'pink' }}>💝</motion.div>
        <motion.div drag whileDrag={{ scale: 1.2 }} className="absolute bottom-[2%] left-[40%] text-3xl -rotate-6 select-none noto-emoji tracking-[-8px] opacity-80 font-bold pointer-events-auto cursor-grab active:cursor-grabbing w-fit h-fit" style={{ color: '#47af5c' }}>🌷🪻🌷🪻🌷</motion.div>
        
        {/* Efek Gelombang Coretan (Waves / Scribbles) */}
        <motion.div drag whileDrag={{ scale: 1.05 }} className="absolute top-[20%] left-[-5%] w-96 h-32 pointer-events-auto cursor-grab active:cursor-grabbing">
          <svg className="w-full h-full opacity-20 stroke-red-500 stroke-[3] fill-transparent -rotate-6 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q12.5,25 25,50 T50,50 T75,50 T100,50" />
          </svg>
        </motion.div>
        <motion.div drag whileDrag={{ scale: 1.05 }} className="absolute top-[60%] right-[-5%] w-[30rem] h-48 pointer-events-auto cursor-grab active:cursor-grabbing">
          <svg className="w-full h-full opacity-10 stroke-black stroke-[4] fill-transparent rotate-[15deg] pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q12.5,75 25,50 T50,50 T75,50 T100,50" />
          </svg>
        </motion.div>
        <motion.div drag whileDrag={{ scale: 1.05 }} className="absolute top-[80%] left-[10%] w-[20rem] h-24 pointer-events-auto cursor-grab active:cursor-grabbing">
          <svg className="w-full h-full opacity-20 stroke-yellow-500 stroke-[5] fill-transparent -rotate-12 pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,50 Q25,30 50,50 T100,50" />
          </svg>
        </motion.div>
      </div>
    </>
  );
};

export default SquiggleDecorations;
