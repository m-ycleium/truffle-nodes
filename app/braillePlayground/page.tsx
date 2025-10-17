"use client";

import { useState, useEffect } from "react";

// Braille character mapping (simplified English Grade 1 Braille)
const brailleMap: { [key: string]: string } = {
  'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛',
  'h': '⠓', 'i': '⠊', 'j': '⠚', 'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝',
  'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞', 'u': '⠥',
  'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵',
  ' ': '⠀',
  '0': '⠚', '1': '⠁', '2': '⠃', '3': '⠉', '4': '⠙', '5': '⠑',
  '6': '⠋', '7': '⠛', '8': '⠓', '9': '⠊',
  '.': '⠲', ',': '⠂', '?': '⠦', '!': '⠖', ':': '⠒', ';': '⠆',
  '-': '⠤', '(': '⠐⠣', ')': '⠐⠜',
};

const textToBraille = (text: string): string => {
  return text
    .toLowerCase()
    .split('')
    .map(char => brailleMap[char] || '⠿')
    .join('');
};

// Animation 1: Typing effect (left to right)
const TypingAnimation = ({ text, frame }: { text: string; frame: number }) => {
  const braille = textToBraille(text);
  const charsToShow = Math.min(Math.floor(frame / 2), braille.length);
  const displayText = braille.slice(0, charsToShow);
  
  return (
    <div style={{ fontFamily: "monospace", fontSize: "28px", letterSpacing: "4px" }}>
      {displayText}
      {charsToShow < braille.length && <span style={{ opacity: 0.3 }}>▮</span>}
    </div>
  );
};

// Animation 2: Shuffle reveal (random characters settle)
const ShuffleAnimation = ({ text, frame }: { text: string; frame: number }) => {
  const braille = textToBraille(text);
  const progress = Math.min(frame / 40, 1);
  
  const displayText = braille.split('').map((char, i) => {
    const charProgress = Math.max(0, progress - (i / braille.length) * 0.5) * 2;
    if (charProgress >= 1) return char;
    
    // Show random braille character while shuffling
    const randomBraille = String.fromCharCode(0x2800 + Math.floor(Math.random() * 64));
    return randomBraille;
  }).join('');
  
  return (
    <div style={{ fontFamily: "monospace", fontSize: "28px", letterSpacing: "4px" }}>
      {displayText}
    </div>
  );
};

// Animation 3: Wave reveal (sine wave from left)
const WaveAnimation = ({ text, frame }: { text: string; frame: number }) => {
  const braille = textToBraille(text);
  
  const displayText = braille.split('').map((char, i) => {
    const wave = Math.sin((frame * 0.2) - (i * 0.5));
    const opacity = wave > 0 ? 1 : 0.2;
    return { char, opacity };
  });
  
  return (
    <div style={{ fontFamily: "monospace", fontSize: "28px", letterSpacing: "4px" }}>
      {displayText.map((item, i) => (
        <span key={i} style={{ opacity: item.opacity, transition: "opacity 0.2s ease" }}>
          {item.char}
        </span>
      ))}
    </div>
  );
};

// Animation 4: Center-out reveal
const CenterOutAnimation = ({ text, frame }: { text: string; frame: number }) => {
  const braille = textToBraille(text);
  const center = Math.floor(braille.length / 2);
  const revealRadius = Math.floor(frame / 3);
  
  const displayText = braille.split('').map((char, i) => {
    const distFromCenter = Math.abs(i - center);
    const isRevealed = distFromCenter <= revealRadius;
    return { char, isRevealed };
  });
  
  return (
    <div style={{ fontFamily: "monospace", fontSize: "28px", letterSpacing: "4px" }}>
      {displayText.map((item, i) => (
        <span key={i} style={{ opacity: item.isRevealed ? 1 : 0.1, transition: "opacity 0.3s ease" }}>
          {item.char}
        </span>
      ))}
    </div>
  );
};

// Y2K muted color palette
const y2kColors = [
  "#9b87d4", // muted purple
  "#7ba8d9", // soft blue
  "#d98bb0", // dusty pink
  "#8bc9b8", // muted aqua
  "#b4d97b", // soft lime
  "#d9a87b", // muted orange
  "#d97b9b", // rose
  "#7bd9c9", // mint
  "#c9b4d9", // lavender
  "#d9c97b", // muted yellow
  "#87b4d4", // sky blue
  "#d4879b", // mauve
  "#87d4b4", // seafoam
  "#d4b487", // tan
  "#b487d4", // plum
  "#87d487", // sage
];

// Animation 5: Colorful Y2K braille (each character different color)
const ColorfulY2KAnimation = ({ text, frame }: { text: string; frame: number }) => {
  const braille = textToBraille(text);
  const charsToShow = Math.min(Math.floor(frame / 2), braille.length);
  
  return (
    <div style={{ fontFamily: "monospace", fontSize: "28px", letterSpacing: "4px" }}>
      {braille.split('').map((char, i) => {
        const color = y2kColors[i % y2kColors.length];
        const isVisible = i < charsToShow;
        
        return (
          <span 
            key={i} 
            style={{ 
              color: isVisible ? color : "transparent",
              transition: "color 0.2s ease",
              fontWeight: "bold",
            }}
          >
            {char}
          </span>
        );
      })}
    </div>
  );
};

export default function BraillePlayground() {
  const [frame, setFrame] = useState(0);
  const [inputText, setInputText] = useState("thinking");

  useEffect(() => {
    const interval = setInterval(() => {
      setFrame((prev) => (prev + 1) % 100);
    }, 100);

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
      <h1 style={{ textAlign: "center", marginBottom: "40px", fontSize: "32px", fontFamily: "monospace" }}>
        Braille Text Animations
      </h1>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto 60px",
          textAlign: "center",
        }}
      >
        <label style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
          Enter text to translate to Braille:
        </label>
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "16px",
            fontFamily: "monospace",
            border: "2px solid #000",
            borderRadius: "8px",
            textAlign: "center",
          }}
          maxLength={30}
        />
        <div style={{ marginTop: "20px", fontSize: "14px", color: "#666" }}>
          Braille output: <span style={{ fontSize: "20px" }}>{textToBraille(inputText)}</span>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "40px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Animation 1: Typing Effect
          </h3>
          <div
            style={{
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <TypingAnimation text={inputText} frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Animation 2: Shuffle Reveal
          </h3>
          <div
            style={{
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <ShuffleAnimation text={inputText} frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Animation 3: Wave Reveal
          </h3>
          <div
            style={{
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <WaveAnimation text={inputText} frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Animation 4: Center-Out Reveal
          </h3>
          <div
            style={{
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <CenterOutAnimation text={inputText} frame={frame} />
          </div>
        </div>

        <div style={{ textAlign: "center" }}>
          <h3 style={{ marginBottom: "20px", fontSize: "14px", color: "#666", fontFamily: "monospace" }}>
            Animation 5: Colorful Y2K Typing
          </h3>
          <div
            style={{
              minHeight: "100px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#f5f5f5",
              border: "2px solid #000",
              borderRadius: "12px",
              padding: "30px",
            }}
          >
            <ColorfulY2KAnimation text={inputText} frame={frame} />
          </div>
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
        <h3 style={{ marginBottom: "10px", fontSize: "14px" }}>About Braille Translation</h3>
        <p style={{ marginBottom: "10px" }}>
          This uses English Grade 1 Braille (uncontracted), where each letter corresponds to a single braille character.
        </p>
        <p>
          The braille patterns are displayed using Unicode characters (U+2800 to U+28FF), making them accessible
          to screen readers and braille displays.
        </p>
      </div>
    </div>
  );
}

