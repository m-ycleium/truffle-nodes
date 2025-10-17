"use client";

import { useState, useEffect } from "react";

// ASCII/Text-based animations
const animation1 = (frame: number): string => {
  const patterns = ["∴", "∵", "∴", "∵"];
  return patterns[frame % patterns.length];
};

const animation2 = (frame: number): string => {
  const patterns = ["∴  ", " ∴ ", "  ∴", " ∴ "];
  return patterns[frame % patterns.length];
};

const animation3 = (frame: number): string => {
  const patterns = ["∵", "⋮", "⋯", "⋰", "⋱"];
  return patterns[frame % patterns.length];
};

const animation4 = (frame: number): string => {
  const patterns = ["⠀⠀⠀", "⠄⠀⠀", "⠆⠀⠀", "⠇⠀⠀", "⠏⠀⠀", "⠟⠀⠀", "⠿⠀⠀", "⠿⠄⠀", "⠿⠆⠀", "⠿⠇⠀", "⠿⠏⠀", "⠿⠟⠀", "⠿⠿⠀", "⠿⠿⠄", "⠿⠿⠆", "⠿⠿⠇", "⠿⠿⠏", "⠿⠿⠟", "⠿⠿⠿"];
  return patterns[frame % patterns.length];
};

// Single-line text animations with ∴ and ∵ (8 elements each)
const singleLineAnimation1 = (frame: number): string => {
  const patterns = [
    "∴ ∵ ∴ ∵ ∴ ∵ ∴ ∵",
    "∵ ∴ ∵ ∴ ∵ ∴ ∵ ∴",
  ];
  return patterns[frame % patterns.length];
};

const singleLineAnimation2 = (frame: number): string => {
  const step = frame % 8;
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += i === step ? "∴" : "∵";
    if (i < 7) result += " ";
  }
  return result;
};

const singleLineAnimation3 = (frame: number): string => {
  const step = frame % 8;
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += i <= step ? "∴" : "∵";
    if (i < 7) result += " ";
  }
  return result;
};

const singleLineAnimation4 = (frame: number): string => {
  const step = frame % 16;
  let result = "";
  for (let i = 0; i < 8; i++) {
    const active = step < 8 ? i <= step : 7 - i <= step - 8;
    result += active ? "∴" : "∵";
    if (i < 7) result += " ";
  }
  return result;
};

// CSS dot animations (returns position data)
const DotAnimation1 = ({ frame }: { frame: number }) => {
  const positions = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
    [0, 1, 1],
    [0, 0, 1],
  ];
  const activePattern = positions[frame % positions.length];

  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {activePattern.map((active, i) => (
        <div
          key={i}
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: active ? "#000" : "#999",
            transition: "background-color 0.15s ease",
          }}
        />
      ))}
    </div>
  );
};

const DotAnimation2 = ({ frame }: { frame: number }) => {
  const scale = Math.sin((frame * Math.PI) / 8);
  const dots = 3;

  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {Array.from({ length: dots }).map((_, i) => {
        const delay = i * 0.33;
        const dotScale = 0.5 + 0.5 * Math.sin((frame * Math.PI) / 6 + delay * Math.PI * 2);
        return (
          <div
            key={i}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#000",
              transform: `scale(${dotScale})`,
              transition: "transform 0.15s ease",
            }}
          />
        );
      })}
    </div>
  );
};

const DotAnimation3 = ({ frame }: { frame: number }) => {
  const active = frame % 3;

  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: "#000",
            transform: `translateY(${i === active ? "-8px" : "0px"})`,
            transition: "transform 0.2s ease",
          }}
        />
      ))}
    </div>
  );
};

const DotAnimation4 = ({ frame }: { frame: number }) => {
  const numDots = 5;
  const activeIndex = frame % (numDots * 2);

  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center" }}>
      {Array.from({ length: numDots }).map((_, i) => {
        const isActive =
          activeIndex < numDots ? i <= activeIndex : i >= numDots * 2 - activeIndex - 1;
        return (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: isActive ? "#000" : "#999",
              transition: "background-color 0.1s ease",
            }}
          />
        );
      })}
    </div>
  );
};

// Multi-line dense dot animations with pseudo random patterns
const BrailleDotAnimation1 = ({ frame }: { frame: number }) => {
  const rows = 4;
  const cols = 6;
  const getPseudoRandom = (i: number, j: number, f: number) => {
    const seed = Math.sin(i * 12.9898 + j * 78.233 + f * 0.1) * 43758.5453;
    return (seed - Math.floor(seed)) > 0.5;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
          {Array.from({ length: cols }).map((_, j) => {
            const isActive = getPseudoRandom(i, j, frame);
            return (
              <div
                key={j}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#000" : "#666",
                  transition: "background-color 0.2s ease",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const BrailleDotAnimation2 = ({ frame }: { frame: number }) => {
  const rows = 5;
  const cols = 5;
  const isActive = (i: number, j: number, f: number) => {
    const wave = Math.sin(f * 0.3 + i * 0.5 + j * 0.5);
    return wave > 0;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
          {Array.from({ length: cols }).map((_, j) => (
            <div
              key={j}
              style={{
                width: "6px",
                height: "6px",
                borderRadius: "50%",
                backgroundColor: isActive(i, j, frame) ? "#000" : "#666",
                transition: "background-color 0.15s ease",
              }}
            />
          ))}
        </div>
      ))}
    </div>
  );
};

const BrailleDotAnimation3 = ({ frame }: { frame: number }) => {
  const rows = 4;
  const cols = 7;
  const hash = (i: number, j: number, f: number) => {
    return ((i * 7 + j * 13 + f) % 11) / 11;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
          {Array.from({ length: cols }).map((_, j) => {
            const val = hash(i, j, frame);
            const isActive = val > 0.4;
            return (
              <div
                key={j}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#000" : "#666",
                  transition: "background-color 0.1s ease",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

const BrailleDotAnimation4 = ({ frame }: { frame: number }) => {
  const rows = 6;
  const cols = 4;
  const noise = (i: number, j: number, f: number) => {
    const x = i / rows + f * 0.1;
    const y = j / cols + f * 0.1;
    return (Math.sin(x * 10) + Math.cos(y * 10) + Math.sin((x + y) * 5)) / 3;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ display: "flex", gap: "4px", justifyContent: "center" }}>
          {Array.from({ length: cols }).map((_, j) => {
            const val = noise(i, j, frame);
            const isActive = val > 0;
            return (
              <div
                key={j}
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: isActive ? "#000" : "#666",
                  transition: "background-color 0.15s ease",
                }}
              />
            );
          })}
        </div>
      ))}
    </div>
  );
};

// LaTeX symbol animations (8 elements)
const latexAnimation1 = (frame: number): string => {
  const symbols = ["∀", "∃", "∈", "∉", "⊂", "⊃", "∩", "∪"];
  const step = frame % 8;
  return symbols.map((s, i) => (i === step ? s : "·")).join(" ");
};

const latexAnimation2 = (frame: number): string => {
  const patterns = [
    "α β γ δ ε ζ η θ",
    "θ η ζ ε δ γ β α",
  ];
  return patterns[frame % patterns.length];
};

const latexAnimation3 = (frame: number): string => {
  const symbols = ["⊕", "⊗", "⊙", "⊚", "⊛", "⊜", "⊝", "⊞"];
  const step = frame % 16;
  return symbols.map((s, i) => (i <= step % 8 ? s : "○")).join(" ");
};

const latexAnimation4 = (frame: number): string => {
  const symbols = ["≤", "≥", "≠", "≈", "≡", "∝", "∞", "∫"];
  const step = frame % (symbols.length * 2);
  const active = step < symbols.length ? step : symbols.length * 2 - step - 1;
  return symbols.map((s, i) => (i === active ? s : "−")).join(" ");
};

// Hidden inactive dot animations
const HiddenDotAnimation1 = ({ frame }: { frame: number }) => {
  const positions = [
    [0, 0, 0],
    [1, 0, 0],
    [1, 1, 0],
    [1, 1, 1],
    [0, 1, 1],
    [0, 0, 1],
  ];
  const activePattern = positions[frame % positions.length];

  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", height: "12px" }}>
      {activePattern.map((active, i) => (
        active ? (
          <div
            key={i}
            style={{
              width: "12px",
              height: "12px",
              borderRadius: "50%",
              backgroundColor: "#000",
            }}
          />
        ) : (
          <div key={i} style={{ width: "12px", height: "12px" }} />
        )
      ))}
    </div>
  );
};

const HiddenDotAnimation2 = ({ frame }: { frame: number }) => {
  const numDots = 5;
  const activeIndex = frame % (numDots * 2);

  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", height: "10px" }}>
      {Array.from({ length: numDots }).map((_, i) => {
        const isActive = activeIndex < numDots ? i <= activeIndex : i >= numDots * 2 - activeIndex - 1;
        return isActive ? (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#000",
            }}
          />
        ) : (
          <div key={i} style={{ width: "10px", height: "10px" }} />
        );
      })}
    </div>
  );
};

const HiddenDotAnimation3 = ({ frame }: { frame: number }) => {
  const numDots = 8;
  const active = frame % numDots;

  return (
    <div style={{ display: "flex", gap: "6px", justifyContent: "center", height: "8px" }}>
      {Array.from({ length: numDots }).map((_, i) => 
        i === active ? (
          <div
            key={i}
            style={{
              width: "8px",
              height: "8px",
              borderRadius: "50%",
              backgroundColor: "#000",
            }}
          />
        ) : (
          <div key={i} style={{ width: "8px", height: "8px" }} />
        )
      )}
    </div>
  );
};

const HiddenDotAnimation4 = ({ frame }: { frame: number }) => {
  const numDots = 6;
  const pattern = [
    [1, 0, 0, 0, 0, 1],
    [0, 1, 0, 0, 1, 0],
    [0, 0, 1, 1, 0, 0],
    [0, 1, 0, 0, 1, 0],
  ];
  const activePattern = pattern[frame % pattern.length];

  return (
    <div style={{ display: "flex", gap: "8px", justifyContent: "center", height: "10px" }}>
      {activePattern.map((active, i) => 
        active ? (
          <div
            key={i}
            style={{
              width: "10px",
              height: "10px",
              borderRadius: "50%",
              backgroundColor: "#000",
            }}
          />
        ) : (
          <div key={i} style={{ width: "10px", height: "10px" }} />
        )
      )}
    </div>
  );
};

export default function GlyphPlayground() {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => prev + 1);
    }, 200);

    return () => clearInterval(interval);
  }, []);

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
      <h1 style={{ textAlign: "center", marginBottom: "60px", fontSize: "32px", fontFamily: "monospace" }}>
        Thinking Animations
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          marginBottom: "80px",
        }}
      >
        {/* ASCII/Text animations */}
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Text Animation 1
          </h3>
          <div
            style={{
              fontSize: "48px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "monospace",
            }}
          >
            {animation1(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Text Animation 2
          </h3>
          <div
            style={{
              fontSize: "48px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "monospace",
            }}
          >
            {animation2(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Text Animation 3
          </h3>
          <div
            style={{
              fontSize: "48px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            {animation3(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Text Animation 4
          </h3>
          <div
            style={{
              fontSize: "32px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            {animation4(frame)}
          </div>
        </div>

        {/* CSS Dot animations */}
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dot Animation 1
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <DotAnimation1 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dot Animation 2
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <DotAnimation2 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dot Animation 3
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <DotAnimation3 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dot Animation 4
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <DotAnimation4 frame={frame} />
          </div>
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "40px", marginTop: "40px", fontSize: "24px", fontFamily: "monospace" }}>
        Single-Line Text Animations (8 elements)
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          marginBottom: "80px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Single-Line 1
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            {singleLineAnimation1(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Single-Line 2
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            {singleLineAnimation2(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Single-Line 3
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            {singleLineAnimation3(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Single-Line 4
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "monospace",
            }}
          >
            {singleLineAnimation4(frame)}
          </div>
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "40px", marginTop: "40px", fontSize: "24px", fontFamily: "monospace" }}>
        Dense Dot Animations (Multi-line)
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          marginBottom: "80px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dense Dots 1 (24)
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <BrailleDotAnimation1 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dense Dots 2 (25)
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <BrailleDotAnimation2 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dense Dots 3 (28)
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <BrailleDotAnimation3 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Dense Dots 4 (24)
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <BrailleDotAnimation4 frame={frame} />
          </div>
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "40px", marginTop: "40px", fontSize: "24px", fontFamily: "monospace" }}>
        LaTeX Symbol Animations (8 elements)
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          marginBottom: "80px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            LaTeX 1
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "monospace",
            }}
          >
            {latexAnimation1(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            LaTeX 2
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "monospace",
            }}
          >
            {latexAnimation2(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            LaTeX 3
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "monospace",
            }}
          >
            {latexAnimation3(frame)}
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            LaTeX 4
          </h3>
          <div
            style={{
              fontSize: "24px",
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
              fontFamily: "monospace",
            }}
          >
            {latexAnimation4(frame)}
          </div>
        </div>
      </div>

      <h2 style={{ textAlign: "center", marginBottom: "40px", marginTop: "40px", fontSize: "24px", fontFamily: "monospace" }}>
        Hidden Inactive Dot Animations
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "40px",
          maxWidth: "1200px",
          margin: "0 auto",
          marginBottom: "80px",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Hidden 1
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <HiddenDotAnimation1 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Hidden 2
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <HiddenDotAnimation2 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Hidden 3
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <HiddenDotAnimation3 frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Hidden 4
          </h3>
          <div
            style={{
              height: "80px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "20px",
            }}
          >
            <HiddenDotAnimation4 frame={frame} />
          </div>
        </div>
      </div>
    </div>
  );
}

