import React, { useCallback, useRef } from "react";

export interface P5WipeHandle {
  triggerWipe: (onMid?: () => void, onDone?: () => void) => void;
}

const P5WipeTransition = React.forwardRef<P5WipeHandle>((_, ref) => {
  const wipeRef = useRef<HTMLDivElement>(null);

  const triggerWipe = useCallback((onMid?: () => void, onDone?: () => void) => {
    const el = wipeRef.current;
    if (!el) return;

    // Restart animation
    el.classList.remove("go");
    void el.offsetWidth;
    el.classList.add("go");

    // Mid-wipe (screen covered): swap content
    setTimeout(() => onMid?.(), 340);
    // Done: animation complete
    setTimeout(() => {
      el.classList.remove("go");
      onDone?.();
    }, 720);
  }, []);

  React.useImperativeHandle(ref, () => ({ triggerWipe }));

  return (
    <div id="p5-wipe" ref={wipeRef} aria-hidden="true">
      <div className="pane p3"></div>
      <div className="pane p2"></div>
      <div className="pane p1"></div>
      <div className="flash"></div>
    </div>
  );
});

P5WipeTransition.displayName = "P5WipeTransition";

export default P5WipeTransition;
