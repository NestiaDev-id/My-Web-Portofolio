import { useEffect, useRef } from "react";

const P5Cursor: React.FC = () => {
  const curRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only for mouse-based devices
    const isFine = matchMedia("(pointer:fine)").matches;
    const prefersReduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!isFine || prefersReduced) return;

    const cur = curRef.current;
    if (!cur) return;

    document.body.classList.add("p5-cursor-on");

    let x = -100, y = -100, frame = 0, last = 0, visible = false;

    const onMove = (e: MouseEvent) => {
      x = e.clientX;
      y = e.clientY;
      if (!visible) {
        cur.style.display = "block";
        visible = true;
      }
      const t = e.target as HTMLElement;
      const overLink = t.closest?.(
        "a,button,.p5-card,.p5-menu-item,.p5-back-hint,.p5-contact-chip,.p5-big-name"
      );
      cur.classList.toggle("link", !!overLink);
    };

    const onLeave = () => {
      cur.style.display = "none";
      visible = false;
    };

    const tick = (ts: number) => {
      if (ts - last >= 50) {
        frame = (frame + 1) % 30;
        last = ts;
        cur.style.backgroundPosition = -frame * 48 + "px 0";
      }
      cur.style.transform = `translate(${x}px, ${y}px)`;
      requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.documentElement.addEventListener("mouseleave", onLeave);
    requestAnimationFrame(tick);

    return () => {
      document.body.classList.remove("p5-cursor-on");
      window.removeEventListener("mousemove", onMove);
      document.documentElement.removeEventListener("mouseleave", onLeave);
    };
  }, []);

  return <div id="p5-cursor" ref={curRef} aria-hidden="true" />;
};

export default P5Cursor;
