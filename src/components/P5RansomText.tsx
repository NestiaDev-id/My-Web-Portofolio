import React, { useMemo } from "react";

function hash(str: string): number {
  let h = 9;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 387420489);
  }
  return (h ^ (h >>> 9)) >>> 0;
}

interface Props {
  text: string;
  className?: string;
}

const P5RansomText: React.FC<Props> = ({ text, className = "" }) => {
  const chars = useMemo(() => {
    return [...text].map((c, i) => {
      const h = hash(text + i);
      const rot = (h % 17) - 8;
      const scale = 0.86 + ((h >> 3) % 30) / 100;
      const dy = ((h >> 5) % 9) - 4;
      const t = `rotate(${rot}deg) scale(${scale}) translateY(${dy}px)`;
      const variant = (h >> 7) % 10;
      let variantClass = "";
      if (variant === 0) variantClass = "box";
      else if (variant === 1) variantClass = "boxw";
      else if (variant === 2) variantClass = "red";

      return { char: c, style: t, variantClass };
    });
  }, [text]);

  return (
    <span className={`p5-ransom ${className}`}>
      {chars.map((ch, i) => (
        <span
          key={i}
          className={`ch p5-display ${ch.variantClass}`}
          style={{ "--t": ch.style, transform: ch.style } as React.CSSProperties}
        >
          {ch.char}
        </span>
      ))}
    </span>
  );
};

export default P5RansomText;
