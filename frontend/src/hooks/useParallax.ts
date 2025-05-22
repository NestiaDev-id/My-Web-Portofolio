// frontend/src/hooks/useParallax.ts
import { useState, useEffect } from "react";

export const useParallax = (speed: number) => {
  const [offsetY, setOffsetY] = useState(0);

  const handleScroll = () => {
    setOffsetY(window.pageYOffset * speed);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [speed]); // Tambahkan speed sebagai dependency agar hook diperbarui jika speed berubah

  return offsetY;
};
