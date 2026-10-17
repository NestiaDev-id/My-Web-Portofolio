import React from "react";

const P5Background: React.FC = () => {
  return (
    <div id="p5-bg" aria-hidden="true">
      <div className="p5-bg-layer" id="p5-bg-stripes"></div>

      {/* Layer 2: Big spinning stars */}
      <svg
        className="p5-bg-star"
        style={{ left: "6%", top: "8%", width: "26vmax", height: "26vmax" }}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,0 60,35 98,35 68,57 78,94 50,72 22,94 32,57 2,35 40,35"
          fill="#000"
        />
      </svg>
      <svg
        className="p5-bg-star s2"
        style={{ right: "4%", bottom: "6%", width: "34vmax", height: "34vmax" }}
        viewBox="0 0 100 100"
      >
        <polygon
          points="50,0 60,35 98,35 68,57 78,94 50,72 22,94 32,57 2,35 40,35"
          fill="#fff"
        />
      </svg>

      <div className="p5-bg-layer" id="p5-bg-halftone"></div>

      <div className="p5-bg-layer" id="p5-bg-vignette"></div>
    </div>
  );
};

export default P5Background;
