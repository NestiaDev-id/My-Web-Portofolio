import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 relative overflow-hidden bg-black text-white font-p5-display">
      {/* Background Graphic elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(230,0,18,0.4)_0%,rgba(0,0,0,0)_60%)]" />
        {/* Halftone / Dot pattern overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.15) 2px, transparent 2px)',
            backgroundSize: '24px 24px'
          }}
        />
      </div>

      <div className="z-10 w-full max-w-4xl mx-auto flex flex-col items-center text-center gap-2">
        {/* "ERROR!" Text */}
        <h2 className="text-3xl md:text-4xl tracking-[0.2em] mb-4 text-white uppercase">
          ERROR!
        </h2>

        {/* Glitched 404 */}
        <div className="glitch-wrapper mb-2">
          <h1 
            className="glitch text-[8rem] md:text-[12rem] leading-none tracking-widest text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            data-text="404"
          >
            404
          </h1>
        </div>

        {/* "PAGE NOT FOUND" Text */}
        <h2 className="text-2xl md:text-4xl tracking-[0.1em] mt-4 text-white uppercase">
          PAGE NOT FOUND
        </h2>

        {/* Return Button */}
        <button
          onClick={() => navigate('/')}
          className="mt-16 px-8 py-3 bg-p5-red text-p5-white font-p5-display text-2xl uppercase tracking-widest shadow-[8px_8px_0_0_#fff] border-2 border-white hover:bg-white hover:text-p5-red hover:shadow-[10px_10px_0_0_#e60012] transition-all transform hover:scale-105 active:scale-95 cursor-pointer skew-x-[-10deg]"
        >
          <span className="inline-block skew-x-[10deg]">Go Back Home</span>
        </button>
      </div>
    </div>
  );
}
