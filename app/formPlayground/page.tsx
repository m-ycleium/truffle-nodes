"use client";

import { useState, useEffect } from "react";

const NUM_NODES = 11;
const NODE_HEIGHT = 16; // Size 16 text equivalent

// Standard dynamic width (scaled down)
const getDynamicWidth = (index: number, time: number, mode: "fluid" | "angular") => {
  const baseWidth = 16;
  const t = time * 0.001;
  
  if (mode === "fluid") {
    const wave = Math.sin(t * 0.8 + index * 0.4) * 6;
    const wave2 = Math.cos(t * 0.5 + index * 0.2) * 3;
    return baseWidth + wave + wave2;
  } else {
    const step = Math.floor(t * 1.5 + index * 0.4) % 4;
    const stepWidth = [0, 3, 8, 5][step];
    return baseWidth + stepWidth;
  }
};

// Standard border radius
const getDynamicBorderRadius = (index: number, time: number, mode: "fluid" | "angular") => {
  const t = time * 0.001;
  
  if (mode === "fluid") {
    // High border radius for rounded, creative feel
    const minRadius = 30;
    const maxRadius = 50;
    const variation = Math.sin(t * 0.5 + index * 0.4) * 0.5 + 0.5;
    return minRadius + variation * (maxRadius - minRadius);
  } else {
    // Low border radius for sharp, analytical feel
    const minRadius = 5;
    const maxRadius = 20;
    const variation = Math.abs(Math.sin(t * 1.2 + index * 0.6));
    return minRadius + variation * (maxRadius - minRadius);
  }
};

// Extreme dynamic width (can go to sliver) - scaled down
const getExtremeDynamicWidth = (index: number, time: number, mode: "fluid" | "angular") => {
  const t = time * 0.001;
  
  if (mode === "fluid") {
    // Range from 2px (sliver) to 22px (wide)
    const minWidth = 2;
    const maxWidth = 22;
    const wave = Math.sin(t * 0.6 + index * 0.5) * 0.5 + 0.5;
    const wave2 = Math.cos(t * 0.4 + index * 0.3) * 0.3;
    return minWidth + (wave + wave2) * (maxWidth - minWidth);
  } else {
    // Sharp transitions between sliver and wide
    const t_fast = t * 2;
    const phase = Math.sin(t_fast + index * 0.7);
    if (phase > 0.5) return 20;
    if (phase > 0) return 12;
    if (phase > -0.5) return 5;
    return 2;
  }
};

// Extreme border radius (can go to complete circle)
const getExtremeBorderRadius = (index: number, time: number, mode: "fluid" | "angular") => {
  const t = time * 0.001;
  
  if (mode === "fluid") {
    // Range from 20% to 50% (circle)
    const minRadius = 20;
    const maxRadius = 50;
    const variation = Math.sin(t * 0.7 + index * 0.6) * 0.5 + 0.5;
    return minRadius + variation * (maxRadius - minRadius);
  } else {
    // Range from 0% (sharp rectangle) to 30%
    const minRadius = 0;
    const maxRadius = 30;
    const step = Math.floor(t * 1.8 + index * 0.5) % 3;
    const stepRadius = [0, 0.4, 1][step];
    return minRadius + stepRadius * (maxRadius - minRadius);
  }
};

// Snappy typing-like width with faster animations
const getSnappyWidth = (index: number, time: number, mode: "fluid" | "angular") => {
  const baseWidth = 12;
  const t = time * 0.001;
  const t_fast = t * 3; // 3x faster
  
  if (mode === "fluid") {
    const wave = Math.sin(t_fast + index * 0.6) * 5;
    const pulse = Math.abs(Math.sin(t_fast * 0.7 + index * 0.4)) * 6;
    return baseWidth + wave + pulse;
  } else {
    const step = Math.floor(t_fast * 2 + index * 0.8) % 3;
    const stepWidth = [0, 5, 12][step];
    return baseWidth + stepWidth;
  }
};

// Dynamic spacing (can go negative for overlaps)
const getDynamicSpacing = (index: number, time: number, mode: "fluid" | "angular") => {
  const t = time * 0.001;
  
  if (mode === "fluid") {
    // Smooth wave between -8 and 12
    const wave = Math.sin(t * 1.2 + index * 0.8) * 10;
    return 2 + wave;
  } else {
    // Sharp jumps between negative and positive spacing
    const phase = Math.sin(t * 2 + index * 0.9);
    if (phase > 0.3) return 10;
    if (phase > -0.3) return 2;
    return -6;
  }
};

// Synchronized border radius (same for all nodes at once)
const getSyncedBorderRadius = (time: number, mode: "fluid" | "angular") => {
  const t = time * 0.001;
  
  if (mode === "fluid") {
    // All nodes pulse together
    const minRadius = 25;
    const maxRadius = 50;
    const variation = Math.sin(t * 0.8) * 0.5 + 0.5;
    return minRadius + variation * (maxRadius - minRadius);
  } else {
    // All nodes snap together between sharp and rounded
    const minRadius = 5;
    const maxRadius = 25;
    const step = Math.floor(t * 1.5) % 2;
    return step === 0 ? minRadius : maxRadius;
  }
};

// Extreme synced border radius
const getExtremeSyncedBorderRadius = (time: number, mode: "fluid" | "angular") => {
  const t = time * 0.001;
  
  if (mode === "fluid") {
    // All nodes pulse from rounded to perfect circles together
    const minRadius = 30;
    const maxRadius = 50;
    const variation = Math.sin(t * 0.6) * 0.5 + 0.5;
    return minRadius + variation * (maxRadius - minRadius);
  } else {
    // All nodes snap together between sharp rectangles and rounded
    const minRadius = 0;
    const maxRadius = 30;
    const step = Math.floor(t * 1.8) % 2;
    return step === 0 ? minRadius : maxRadius;
  }
};

// Version 1: Standard dynamic width, height static
const DynamicWidthNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getDynamicWidth(i, time, mode);
        const borderRadius = getDynamicBorderRadius(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${borderRadius}%`,
              transition: "all 0.1s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

// Version 2: Extreme dynamic width and border radius
const ExtremeDynamicNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "3px",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getExtremeDynamicWidth(i, time, mode);
        const borderRadius = getExtremeBorderRadius(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${borderRadius}%`,
              transition: "all 0.1s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

// Version 3: Snappy with overlaps
const SnappyOverlapNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getSnappyWidth(i, time, mode);
        const borderRadius = getDynamicBorderRadius(i, time, mode);
        const spacing = i === 0 ? 0 : getDynamicSpacing(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${borderRadius}%`,
              marginLeft: i === 0 ? 0 : `${spacing}px`,
              transition: "all 0.05s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

// Version 4: Extreme snappy with overlaps
const ExtremeSnappyOverlapNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getSnappyWidth(i, time, mode);
        const borderRadius = getExtremeBorderRadius(i, time, mode);
        const spacing = i === 0 ? 0 : getDynamicSpacing(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${borderRadius}%`,
              marginLeft: i === 0 ? 0 : `${spacing}px`,
              transition: "all 0.05s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

// Version 5: Snappy overlaps + instant border radius
const InstantRadiusOverlapNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getSnappyWidth(i, time, mode);
        const borderRadius = getDynamicBorderRadius(i, time, mode);
        const spacing = i === 0 ? 0 : getDynamicSpacing(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${borderRadius}%`,
              marginLeft: i === 0 ? 0 : `${spacing}px`,
              transition: "width 0.05s ease-out, margin-left 0.05s ease-out, border-radius 0.015s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

// Version 6: Extreme snappy overlaps + instant border radius
const ExtremeInstantRadiusOverlapNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getSnappyWidth(i, time, mode);
        const borderRadius = getExtremeBorderRadius(i, time, mode);
        const spacing = i === 0 ? 0 : getDynamicSpacing(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${borderRadius}%`,
              marginLeft: i === 0 ? 0 : `${spacing}px`,
              transition: "width 0.05s ease-out, margin-left 0.05s ease-out, border-radius 0.015s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

// Version 7: Synced border radius + tight spacing
const SyncedRadiusTightNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const syncedRadius = getSyncedBorderRadius(time, mode);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1px",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getSnappyWidth(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${syncedRadius}%`,
              transition: "width 0.05s ease-out, border-radius 0.05s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

// Version 8: Extreme synced border radius + tight spacing
const ExtremeSyncedRadiusTightNodes = ({ mode }: { mode: "fluid" | "angular" }) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let animationFrameId: number;
    const animate = (timestamp: number) => {
      setTime(timestamp);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const syncedRadius = getExtremeSyncedBorderRadius(time, mode);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "1px",
        height: "40px",
      }}
    >
      {Array.from({ length: NUM_NODES }).map((_, i) => {
        const width = getSnappyWidth(i, time, mode);
        
        return (
          <div
            key={i}
            style={{
              width: `${width}px`,
              height: `${NODE_HEIGHT}px`,
              backgroundColor: "#000",
              borderRadius: `${syncedRadius}%`,
              transition: "width 0.05s ease-out, border-radius 0.05s ease-out",
            }}
          />
        );
      })}
    </div>
  );
};

export default function FormPlayground() {
  const [mode, setMode] = useState<"fluid" | "angular">("fluid");

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#fff",
        color: "#000",
        padding: "40px",
        fontFamily: "monospace",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          marginBottom: "20px",
          fontSize: "32px",
          fontFamily: "monospace",
        }}
      >
        Form Playground
      </h1>

      <p
        style={{
          textAlign: "center",
          marginBottom: "40px",
          fontSize: "14px",
          color: "#666",
          maxWidth: "600px",
          margin: "0 auto 40px",
          lineHeight: "1.6",
        }}
      >
        Exploring how shape, size, and movement can communicate tone. Fluid patterns suggest
        creative, flowing thought. Angular patterns suggest analytical, structured thought.
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "10px",
          marginBottom: "60px",
        }}
      >
        <button
          onClick={() => setMode("fluid")}
          style={{
            padding: "12px 24px",
            fontSize: "14px",
            fontFamily: "monospace",
            backgroundColor: mode === "fluid" ? "#000" : "#fff",
            color: mode === "fluid" ? "#fff" : "#000",
            border: "2px solid #000",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Fluid / Creative
        </button>
        <button
          onClick={() => setMode("angular")}
          style={{
            padding: "12px 24px",
            fontSize: "14px",
            fontFamily: "monospace",
            backgroundColor: mode === "angular" ? "#000" : "#fff",
            color: mode === "angular" ? "#fff" : "#000",
            border: "2px solid #000",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Angular / Analytical
        </button>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          maxWidth: "1800px",
          margin: "0 auto",
        }}
      >
        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Standard Range
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <DynamicWidthNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            Standard width range with moderate border radius
          </p>
        </div>

        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Extreme Range
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExtremeDynamicNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            Slivers to wide shapes, full circle/rectangle range
          </p>
        </div>

        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Snappy + Overlaps
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SnappyOverlapNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            3x faster, dynamic spacing allows overlaps
          </p>
        </div>

        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Extreme Snappy + Overlaps
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExtremeSnappyOverlapNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            Fast typing feel with extreme shapes and overlaps
          </p>
        </div>

        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Instant Radius + Overlaps
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <InstantRadiusOverlapNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            Snappy overlaps + near-instant border radius (0.015s)
          </p>
        </div>

        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Extreme Instant Radius
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExtremeInstantRadiusOverlapNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            Extreme shapes + overlaps + instant radius morphs
          </p>
        </div>

        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Synced Radius + Tight
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <SyncedRadiusTightNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            All nodes share one synchronized border radius, 1px gap
          </p>
        </div>

        <div>
          <h2
            style={{
              textAlign: "center",
              marginBottom: "15px",
              fontSize: "14px",
              fontFamily: "monospace",
              color: "#666",
            }}
          >
            Extreme Synced + Tight
          </h2>
          <div
            style={{
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "8px",
              padding: "20px",
              minHeight: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <ExtremeSyncedRadiusTightNodes mode={mode} />
          </div>
          <p
            style={{
              textAlign: "center",
              marginTop: "10px",
              fontSize: "11px",
              color: "#999",
              fontFamily: "monospace",
              lineHeight: "1.4",
            }}
          >
            Synced extreme shapes (0-50% radius), ultra tight 1px gaps
          </p>
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "60px auto 0",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          border: "2px solid #000",
          borderRadius: "12px",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        <h3 style={{ marginBottom: "10px", fontSize: "14px", fontFamily: "monospace" }}>
          Design Principles
        </h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li style={{ marginBottom: "8px" }}>
            <strong>Size 16 scale:</strong> Small enough to sit inline with text
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Fluid mode:</strong> Smooth sine waves, high border radius, gentle transitions
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Angular mode:</strong> Stepped patterns, sharp edges (0% radius), abrupt transitions
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Standard versions (1-2):</strong> Fixed spacing, slower pace for readability
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Overlap versions (3-4):</strong> Dynamic spacing (-6 to +12px), 3x faster, typing feel
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Instant radius versions (5-6):</strong> Border radius transitions at 0.015s (3x faster), while width/spacing remain at 0.05s
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Synced radius versions (7-8):</strong> All nodes share a single synchronized border radius (not offset by position), with ultra-tight 1px gaps
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>11 nodes:</strong> Enough variety to create rhythm without overwhelming
          </li>
          <li>
            Most versions: Each node's animation is offset by position, creating wave-like propagation
          </li>
          <li>
            Synced versions (7-8): All nodes morph together as a unified form
          </li>
        </ul>
      </div>
    </div>
  );
}

