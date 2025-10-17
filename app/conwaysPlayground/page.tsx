"use client";

import { useRef, useEffect, useState, useCallback } from "react";

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
const CELL_SIZE = 10;
const COLS = Math.floor(CANVAS_WIDTH / CELL_SIZE);
const ROWS = Math.floor(CANVAS_HEIGHT / CELL_SIZE);

type Grid = boolean[][];

const createEmptyGrid = (): Grid => {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(false));
};

const createRandomGrid = (): Grid => {
  return Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => Math.random() > 0.7)
  );
};

const countNeighbors = (grid: Grid, row: number, col: number): number => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = row + i;
      const newCol = col + j;
      
      if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
        if (grid[newRow][newCol]) count++;
      }
    }
  }
  return count;
};

const computeNextGeneration = (grid: Grid): Grid => {
  const newGrid = createEmptyGrid();
  
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const neighbors = countNeighbors(grid, row, col);
      const isAlive = grid[row][col];
      
      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        newGrid[row][col] = true;
      } else if (!isAlive && neighbors === 3) {
        newGrid[row][col] = true;
      } else {
        newGrid[row][col] = false;
      }
    }
  }
  
  return newGrid;
};

const drawGrid = (ctx: CanvasRenderingContext2D, grid: Grid) => {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  
  // Draw circles for alive cells
  ctx.fillStyle = "#000";
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      if (grid[row][col]) {
        const x = col * CELL_SIZE + CELL_SIZE / 2;
        const y = row * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 2 - 1;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

export default function ConwaysPlayground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<Grid>(createRandomGrid);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(10); // generations per second
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  // Draw grid whenever it changes
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawGrid(ctx, grid);
  }, [grid]);

  // Animation loop
  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      const interval = 1000 / speed;
      
      if (timestamp - lastUpdateRef.current >= interval) {
        setGrid(prevGrid => computeNextGeneration(prevGrid));
        setGeneration(prev => prev + 1);
        lastUpdateRef.current = timestamp;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / CELL_SIZE);
    const row = Math.floor(y / CELL_SIZE);
    
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => [...r]);
        newGrid[row][col] = !newGrid[row][col];
        return newGrid;
      });
    }
  }, []);

  const handleReset = () => {
    setGrid(createEmptyGrid());
    setGeneration(0);
    setIsPlaying(false);
  };

  const handleRandomize = () => {
    setGrid(createRandomGrid());
    setGeneration(0);
  };

  const handleStep = () => {
    setGrid(prevGrid => computeNextGeneration(prevGrid));
    setGeneration(prev => prev + 1);
  };

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
      <h1 style={{ textAlign: "center", marginBottom: "20px", fontSize: "32px" }}>
        Conway's Game of Life
      </h1>
      
      <p style={{ textAlign: "center", marginBottom: "40px", fontSize: "14px", color: "#666" }}>
        Each cell is a circle. Click to toggle cells, or use controls below.
      </p>

      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onClick={handleCanvasClick}
          style={{
            border: "2px solid #000",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#f5f5f5",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          Generation: <strong>{generation}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: isPlaying ? "#000" : "#fff",
              color: isPlaying ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: isPlaying ? "not-allowed" : "pointer",
              opacity: isPlaying ? 0.5 : 1,
              fontWeight: "bold",
            }}
          >
            Step
          </button>

          <button
            onClick={handleRandomize}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Randomize
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            Speed: {speed} generations/sec
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "300px" }}
          />
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
        <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
          Conway's Game of Life Rules
        </h3>
        <ul style={{ marginLeft: "20px", marginTop: "10px" }}>
          <li style={{ marginBottom: "8px" }}>
            Any live cell with 2 or 3 live neighbors survives
          </li>
          <li style={{ marginBottom: "8px" }}>
            Any dead cell with exactly 3 live neighbors becomes alive
          </li>
          <li style={{ marginBottom: "8px" }}>
            All other live cells die, and all other dead cells stay dead
          </li>
        </ul>
        <p style={{ marginTop: "15px" }}>
          This implementation uses circles instead of square pixels for a smoother, more organic aesthetic.
          Try creating patterns like gliders, blinkers, or beacons!
        </p>
      </div>

      {/* Continuous Gliders Version */}
      <div style={{ marginTop: "80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "28px" }}>
          Continuous Gliders Version
        </h2>
        
        <p style={{ textAlign: "center", marginBottom: "40px", fontSize: "14px", color: "#666" }}>
          Initialized with multiple gliders that continuously move across the grid.
        </p>

        <ContinuousGlidersConway />
      </div>

      {/* 4-Line Version */}
      <div style={{ marginTop: "80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "28px" }}>
          4-Line Constrained Version
        </h2>
        
        <p style={{ textAlign: "center", marginBottom: "40px", fontSize: "14px", color: "#666" }}>
          Same rules, but limited to only 4 rows. Creates unique horizontal patterns.
        </p>

        <FourLineConway />
      </div>

      {/* 4-Line Modified Rules Version */}
      <div style={{ marginTop: "80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "28px" }}>
          4-Line Dynamic Rules Version
        </h2>
        
        <p style={{ textAlign: "center", marginBottom: "40px", fontSize: "14px", color: "#666" }}>
          Modified rules (B36/S245) optimized for continuous dynamic activity in 4 rows.
        </p>

        <FourLineDynamicConway />
      </div>

      {/* Scrolling Viewport Version */}
      <div style={{ marginTop: "80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "28px" }}>
          Scrolling Viewport Version
        </h2>
        
        <p style={{ textAlign: "center", marginBottom: "40px", fontSize: "14px", color: "#666" }}>
          Full grid simulation, but only 4 rows visible. Scroll down to freeze lines above.
        </p>

        <ScrollingViewportConway />
      </div>

      {/* Building Rows Version */}
      <div style={{ marginTop: "80px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px", fontSize: "28px" }}>
          Building Rows Version
        </h2>
        
        <p style={{ textAlign: "center", marginBottom: "40px", fontSize: "14px", color: "#666" }}>
          Each scroll adds a filled row at the top, building downward like inverted Tetris.
        </p>

        <BuildingRowsConway />
      </div>
    </div>
  );
}

// 4-Line Constrained Version Component
const CANVAS_WIDTH_4LINE = 800;
const CANVAS_HEIGHT_4LINE = 80;
const CELL_SIZE_4LINE = 20;
const COLS_4LINE = Math.floor(CANVAS_WIDTH_4LINE / CELL_SIZE_4LINE);
const ROWS_4LINE = 4;

type Grid4Line = boolean[][];

const createEmptyGrid4Line = (): Grid4Line => {
  return Array.from({ length: ROWS_4LINE }, () => Array(COLS_4LINE).fill(false));
};

const createRandomGrid4Line = (): Grid4Line => {
  return Array.from({ length: ROWS_4LINE }, () =>
    Array.from({ length: COLS_4LINE }, () => Math.random() > 0.7)
  );
};

const countNeighbors4Line = (grid: Grid4Line, row: number, col: number): number => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = row + i;
      const newCol = col + j;
      
      if (newRow >= 0 && newRow < ROWS_4LINE && newCol >= 0 && newCol < COLS_4LINE) {
        if (grid[newRow][newCol]) count++;
      }
    }
  }
  return count;
};

const computeNextGeneration4Line = (grid: Grid4Line): Grid4Line => {
  const newGrid = createEmptyGrid4Line();
  
  for (let row = 0; row < ROWS_4LINE; row++) {
    for (let col = 0; col < COLS_4LINE; col++) {
      const neighbors = countNeighbors4Line(grid, row, col);
      const isAlive = grid[row][col];
      
      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        newGrid[row][col] = true;
      } else if (!isAlive && neighbors === 3) {
        newGrid[row][col] = true;
      } else {
        newGrid[row][col] = false;
      }
    }
  }
  
  return newGrid;
};

const drawGrid4Line = (ctx: CanvasRenderingContext2D, grid: Grid4Line) => {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, CANVAS_WIDTH_4LINE, CANVAS_HEIGHT_4LINE);
  
  // Draw circles for alive cells
  ctx.fillStyle = "#000";
  for (let row = 0; row < ROWS_4LINE; row++) {
    for (let col = 0; col < COLS_4LINE; col++) {
      if (grid[row][col]) {
        const x = col * CELL_SIZE_4LINE + CELL_SIZE_4LINE / 2;
        const y = row * CELL_SIZE_4LINE + CELL_SIZE_4LINE / 2;
        const radius = CELL_SIZE_4LINE / 2 - 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

function FourLineConway() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<Grid4Line>(createRandomGrid4Line);
  const [isPlaying, setIsPlaying] = useState(false);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(10);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawGrid4Line(ctx, grid);
  }, [grid]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      const interval = 1000 / speed;
      
      if (timestamp - lastUpdateRef.current >= interval) {
        setGrid(prevGrid => computeNextGeneration4Line(prevGrid));
        setGeneration(prev => prev + 1);
        lastUpdateRef.current = timestamp;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / CELL_SIZE_4LINE);
    const row = Math.floor(y / CELL_SIZE_4LINE);
    
    if (row >= 0 && row < ROWS_4LINE && col >= 0 && col < COLS_4LINE) {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => [...r]);
        newGrid[row][col] = !newGrid[row][col];
        return newGrid;
      });
    }
  }, []);

  const handleReset = () => {
    setGrid(createEmptyGrid4Line());
    setGeneration(0);
    setIsPlaying(false);
  };

  const handleRandomize = () => {
    setGrid(createRandomGrid4Line());
    setGeneration(0);
  };

  const handleStep = () => {
    setGrid(prevGrid => computeNextGeneration4Line(prevGrid));
    setGeneration(prev => prev + 1);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH_4LINE}
          height={CANVAS_HEIGHT_4LINE}
          onClick={handleCanvasClick}
          style={{
            border: "2px solid #000",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#f5f5f5",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          Generation: <strong>{generation}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: isPlaying ? "#000" : "#fff",
              color: isPlaying ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: isPlaying ? "not-allowed" : "pointer",
              opacity: isPlaying ? 0.5 : 1,
              fontWeight: "bold",
            }}
          >
            Step
          </button>

          <button
            onClick={handleRandomize}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Randomize
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            Speed: {speed} generations/sec
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "300px" }}
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "40px auto 0",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          border: "2px solid #000",
          borderRadius: "12px",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
          4-Line Constraints
        </h3>
        <p>
          This version constrains the game to only 4 rows, creating interesting horizontal patterns
          and behaviors. The limited vertical space produces unique emergent patterns that differ
          from the full grid version. Larger circles (20px) make it easier to see individual cells.
        </p>
      </div>
    </div>
  );
}

// Continuous Gliders Version
const GLIDER_PATTERN = [
  [0, 1, 0],
  [0, 0, 1],
  [1, 1, 1],
];

const createGliderGrid = (): Grid => {
  const grid = createEmptyGrid();
  
  // Place gliders in a grid pattern with spacing
  const gliderSpacing = 15;
  const offsetX = 5;
  const offsetY = 5;
  
  for (let gy = 0; gy < Math.floor((ROWS - offsetY) / gliderSpacing); gy++) {
    for (let gx = 0; gx < Math.floor((COLS - offsetX) / gliderSpacing); gx++) {
      const startRow = offsetY + gy * gliderSpacing;
      const startCol = offsetX + gx * gliderSpacing;
      
      // Place glider pattern
      for (let i = 0; i < GLIDER_PATTERN.length; i++) {
        for (let j = 0; j < GLIDER_PATTERN[i].length; j++) {
          if (GLIDER_PATTERN[i][j] === 1) {
            const row = startRow + i;
            const col = startCol + j;
            if (row < ROWS && col < COLS) {
              grid[row][col] = true;
            }
          }
        }
      }
    }
  }
  
  return grid;
};

function ContinuousGlidersConway() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<Grid>(createGliderGrid);
  const [isPlaying, setIsPlaying] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(5);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawGrid(ctx, grid);
  }, [grid]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      const interval = 1000 / speed;
      
      if (timestamp - lastUpdateRef.current >= interval) {
        setGrid(prevGrid => computeNextGeneration(prevGrid));
        setGeneration(prev => prev + 1);
        lastUpdateRef.current = timestamp;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleReset = () => {
    setGrid(createGliderGrid());
    setGeneration(0);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            border: "2px solid #000",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          Generation: <strong>{generation}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: isPlaying ? "#000" : "#fff",
              color: isPlaying ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Reset Gliders
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            Speed: {speed} generations/sec
          </label>
          <input
            type="range"
            min="1"
            max="20"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "300px" }}
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "40px auto 0",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          border: "2px solid #000",
          borderRadius: "12px",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
          About Gliders
        </h3>
        <p>
          Gliders are small patterns that move diagonally across the grid. This version initializes
          with multiple gliders spaced across the canvas. Watch as they travel and occasionally
          collide to create new patterns. The gliders demonstrate emergent behavior from simple rules.
        </p>
      </div>
    </div>
  );
}

// 4-Line Dynamic Rules Version (Modified B/S rules)
const CANVAS_WIDTH_DYNAMIC = 800;
const CANVAS_HEIGHT_DYNAMIC = 80;
const CELL_SIZE_DYNAMIC = 20;
const COLS_DYNAMIC = Math.floor(CANVAS_WIDTH_DYNAMIC / CELL_SIZE_DYNAMIC);
const ROWS_DYNAMIC = 4;

type GridDynamic = boolean[][];

const createEmptyGridDynamic = (): GridDynamic => {
  return Array.from({ length: ROWS_DYNAMIC }, () => Array(COLS_DYNAMIC).fill(false));
};

const createRandomGridDynamic = (): GridDynamic => {
  return Array.from({ length: ROWS_DYNAMIC }, () =>
    Array.from({ length: COLS_DYNAMIC }, () => Math.random() > 0.6)
  );
};

const countNeighborsDynamic = (grid: GridDynamic, row: number, col: number): number => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = row + i;
      const newCol = col + j;
      
      if (newRow >= 0 && newRow < ROWS_DYNAMIC && newCol >= 0 && newCol < COLS_DYNAMIC) {
        if (grid[newRow][newCol]) count++;
      }
    }
  }
  return count;
};

// Modified rules: B36/S245
// Birth on 3 or 6 neighbors, Survive on 2, 4, or 5 neighbors
const computeNextGenerationDynamic = (grid: GridDynamic): GridDynamic => {
  const newGrid = createEmptyGridDynamic();
  
  for (let row = 0; row < ROWS_DYNAMIC; row++) {
    for (let col = 0; col < COLS_DYNAMIC; col++) {
      const neighbors = countNeighborsDynamic(grid, row, col);
      const isAlive = grid[row][col];
      
      if (isAlive) {
        // Survive on 2, 4, or 5 neighbors
        if (neighbors === 2 || neighbors === 4 || neighbors === 5) {
          newGrid[row][col] = true;
        }
      } else {
        // Birth on 3 or 6 neighbors
        if (neighbors === 3 || neighbors === 6) {
          newGrid[row][col] = true;
        }
      }
    }
  }
  
  return newGrid;
};

const drawGridDynamic = (ctx: CanvasRenderingContext2D, grid: GridDynamic) => {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, CANVAS_WIDTH_DYNAMIC, CANVAS_HEIGHT_DYNAMIC);
  
  // Draw circles for alive cells
  ctx.fillStyle = "#000";
  for (let row = 0; row < ROWS_DYNAMIC; row++) {
    for (let col = 0; col < COLS_DYNAMIC; col++) {
      if (grid[row][col]) {
        const x = col * CELL_SIZE_DYNAMIC + CELL_SIZE_DYNAMIC / 2;
        const y = row * CELL_SIZE_DYNAMIC + CELL_SIZE_DYNAMIC / 2;
        const radius = CELL_SIZE_DYNAMIC / 2 - 2;
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

function FourLineDynamicConway() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<GridDynamic>(createRandomGridDynamic);
  const [isPlaying, setIsPlaying] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(8);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawGridDynamic(ctx, grid);
  }, [grid]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      const interval = 1000 / speed;
      
      if (timestamp - lastUpdateRef.current >= interval) {
        setGrid(prevGrid => computeNextGenerationDynamic(prevGrid));
        setGeneration(prev => prev + 1);
        lastUpdateRef.current = timestamp;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const col = Math.floor(x / CELL_SIZE_DYNAMIC);
    const row = Math.floor(y / CELL_SIZE_DYNAMIC);
    
    if (row >= 0 && row < ROWS_DYNAMIC && col >= 0 && col < COLS_DYNAMIC) {
      setGrid(prevGrid => {
        const newGrid = prevGrid.map(r => [...r]);
        newGrid[row][col] = !newGrid[row][col];
        return newGrid;
      });
    }
  }, []);

  const handleReset = () => {
    setGrid(createEmptyGridDynamic());
    setGeneration(0);
    setIsPlaying(false);
  };

  const handleRandomize = () => {
    setGrid(createRandomGridDynamic());
    setGeneration(0);
  };

  const handleStep = () => {
    setGrid(prevGrid => computeNextGenerationDynamic(prevGrid));
    setGeneration(prev => prev + 1);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH_DYNAMIC}
          height={CANVAS_HEIGHT_DYNAMIC}
          onClick={handleCanvasClick}
          style={{
            border: "2px solid #000",
            borderRadius: "8px",
            cursor: "pointer",
            backgroundColor: "#f5f5f5",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          Generation: <strong>{generation}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: isPlaying ? "#000" : "#fff",
              color: isPlaying ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleStep}
            disabled={isPlaying}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: isPlaying ? "not-allowed" : "pointer",
              opacity: isPlaying ? 0.5 : 1,
              fontWeight: "bold",
            }}
          >
            Step
          </button>

          <button
            onClick={handleRandomize}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Randomize
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            Speed: {speed} generations/sec
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "300px" }}
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "40px auto 0",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          border: "2px solid #000",
          borderRadius: "12px",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
          Modified Rules: B36/S245
        </h3>
        <p style={{ marginBottom: "10px" }}>
          Unlike standard Conway's rules, this version uses:
        </p>
        <ul style={{ marginLeft: "20px" }}>
          <li style={{ marginBottom: "8px" }}>
            <strong>Birth (B):</strong> A dead cell becomes alive with 3 or 6 neighbors
          </li>
          <li style={{ marginBottom: "8px" }}>
            <strong>Survival (S):</strong> A live cell survives with 2, 4, or 5 neighbors
          </li>
        </ul>
        <p style={{ marginTop: "10px" }}>
          These modified rules create more dynamic, chaotic patterns that work well in the constrained
          4-line space, maintaining continuous activity and interesting oscillating structures.
        </p>
      </div>
    </div>
  );
}

// Scrolling Viewport Version
const CANVAS_WIDTH_SCROLL = 800;
const CANVAS_HEIGHT_SCROLL = 80; // Display 4 rows
const CELL_SIZE_SCROLL = 20;
const COLS_SCROLL = Math.floor(CANVAS_WIDTH_SCROLL / CELL_SIZE_SCROLL);
const VISIBLE_ROWS = 4;
const TOTAL_ROWS_SCROLL = 60; // Full grid is 60 rows tall

type GridScroll = boolean[][];
type FrozenRows = Set<number>;

const createEmptyGridScroll = (): GridScroll => {
  return Array.from({ length: TOTAL_ROWS_SCROLL }, () => Array(COLS_SCROLL).fill(false));
};

const createRandomGridScroll = (): GridScroll => {
  return Array.from({ length: TOTAL_ROWS_SCROLL }, () =>
    Array.from({ length: COLS_SCROLL }, () => Math.random() > 0.7)
  );
};

const countNeighborsScroll = (grid: GridScroll, row: number, col: number): number => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = row + i;
      const newCol = col + j;
      
      if (newRow >= 0 && newRow < TOTAL_ROWS_SCROLL && newCol >= 0 && newCol < COLS_SCROLL) {
        if (grid[newRow][newCol]) count++;
      }
    }
  }
  return count;
};

const computeNextGenerationScroll = (grid: GridScroll, frozenRows: FrozenRows): GridScroll => {
  const newGrid = grid.map(row => [...row]);
  
  for (let row = 0; row < TOTAL_ROWS_SCROLL; row++) {
    // Skip frozen rows
    if (frozenRows.has(row)) continue;
    
    for (let col = 0; col < COLS_SCROLL; col++) {
      const neighbors = countNeighborsScroll(grid, row, col);
      const isAlive = grid[row][col];
      
      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        newGrid[row][col] = true;
      } else if (!isAlive && neighbors === 3) {
        newGrid[row][col] = true;
      } else {
        newGrid[row][col] = false;
      }
    }
  }
  
  return newGrid;
};

const drawGridScroll = (
  ctx: CanvasRenderingContext2D, 
  grid: GridScroll, 
  viewportStartRow: number,
  frozenRows: FrozenRows
) => {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, CANVAS_WIDTH_SCROLL, CANVAS_HEIGHT_SCROLL);
  
  // Draw circles for alive cells in the viewport
  for (let displayRow = 0; displayRow < VISIBLE_ROWS; displayRow++) {
    const gridRow = viewportStartRow + displayRow;
    if (gridRow >= TOTAL_ROWS_SCROLL) break;
    
    for (let col = 0; col < COLS_SCROLL; col++) {
      if (grid[gridRow][col]) {
        const x = col * CELL_SIZE_SCROLL + CELL_SIZE_SCROLL / 2;
        const y = displayRow * CELL_SIZE_SCROLL + CELL_SIZE_SCROLL / 2;
        const radius = CELL_SIZE_SCROLL / 2 - 2;
        
        // Frozen rows are rendered in gray
        ctx.fillStyle = frozenRows.has(gridRow) ? "#999" : "#000";
        
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

function ScrollingViewportConway() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [grid, setGrid] = useState<GridScroll>(createRandomGridScroll);
  const [isPlaying, setIsPlaying] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(8);
  const [viewportStartRow, setViewportStartRow] = useState(0);
  const [frozenRows, setFrozenRows] = useState<FrozenRows>(new Set());
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawGridScroll(ctx, grid, viewportStartRow, frozenRows);
  }, [grid, viewportStartRow, frozenRows]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      const interval = 1000 / speed;
      
      if (timestamp - lastUpdateRef.current >= interval) {
        setGrid(prevGrid => computeNextGenerationScroll(prevGrid, frozenRows));
        setGeneration(prev => prev + 1);
        lastUpdateRef.current = timestamp;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed, frozenRows]);

  const handleScrollDown = () => {
    if (viewportStartRow + VISIBLE_ROWS < TOTAL_ROWS_SCROLL) {
      // Freeze the top row of the current viewport
      setFrozenRows(prev => {
        const newFrozen = new Set(prev);
        newFrozen.add(viewportStartRow);
        return newFrozen;
      });
      
      // Move viewport down by 1
      setViewportStartRow(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setGrid(createEmptyGridScroll());
    setGeneration(0);
    setViewportStartRow(0);
    setFrozenRows(new Set());
    setIsPlaying(false);
  };

  const handleRandomize = () => {
    setGrid(createRandomGridScroll());
    setGeneration(0);
    setViewportStartRow(0);
    setFrozenRows(new Set());
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH_SCROLL}
          height={CANVAS_HEIGHT_SCROLL}
          style={{
            border: "2px solid #000",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          Generation: <strong>{generation}</strong> | Viewing rows: <strong>{viewportStartRow} - {viewportStartRow + VISIBLE_ROWS - 1}</strong> | Frozen: <strong>{frozenRows.size}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: isPlaying ? "#000" : "#fff",
              color: isPlaying ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleScrollDown}
            disabled={viewportStartRow + VISIBLE_ROWS >= TOTAL_ROWS_SCROLL}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: viewportStartRow + VISIBLE_ROWS >= TOTAL_ROWS_SCROLL ? "not-allowed" : "pointer",
              opacity: viewportStartRow + VISIBLE_ROWS >= TOTAL_ROWS_SCROLL ? 0.5 : 1,
              fontWeight: "bold",
            }}
          >
            Scroll Down ↓
          </button>

          <button
            onClick={handleRandomize}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Randomize
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            Speed: {speed} generations/sec
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "300px" }}
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "40px auto 0",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          border: "2px solid #000",
          borderRadius: "12px",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
          Scrolling Viewport
        </h3>
        <p style={{ marginBottom: "10px" }}>
          This version runs a full 60×40 Conway's Game of Life grid, but only displays 4 rows at a time.
        </p>
        <ul style={{ marginLeft: "20px" }}>
          <li style={{ marginBottom: "8px" }}>
            Click "Scroll Down" to move the viewport down by one row
          </li>
          <li style={{ marginBottom: "8px" }}>
            When scrolling, the top row becomes <strong>frozen</strong> (shown in gray)
          </li>
          <li style={{ marginBottom: "8px" }}>
            Frozen rows are static and no longer participate in the simulation
          </li>
          <li style={{ marginBottom: "8px" }}>
            The full grid continues to evolve below the viewport
          </li>
        </ul>
      </div>
    </div>
  );
}

// Building Rows Version (like inverted Tetris)
const CANVAS_WIDTH_BUILD = 800;
const CELL_SIZE_BUILD = 20;
const COLS_BUILD = Math.floor(CANVAS_WIDTH_BUILD / CELL_SIZE_BUILD);
const VISIBLE_ROWS_BUILD = 4; // Number of visible simulation rows
const TOTAL_GRID_ROWS = 60; // Full underlying grid

type GridBuild = boolean[][];

const createEmptyGridBuild = (): GridBuild => {
  return Array.from({ length: TOTAL_GRID_ROWS }, () => Array(COLS_BUILD).fill(false));
};

const createRandomGridBuild = (): GridBuild => {
  return Array.from({ length: TOTAL_GRID_ROWS }, () =>
    Array.from({ length: COLS_BUILD }, () => Math.random() > 0.7)
  );
};

const createFilledRow = (): boolean[] => {
  return Array(COLS_BUILD).fill(true);
};

const countNeighborsBuild = (grid: GridBuild, row: number, col: number): number => {
  let count = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      
      const newRow = row + i;
      const newCol = col + j;
      
      if (newRow >= 0 && newRow < TOTAL_GRID_ROWS && newCol >= 0 && newCol < COLS_BUILD) {
        if (grid[newRow][newCol]) count++;
      }
    }
  }
  return count;
};

const computeNextGenerationBuild = (fullGrid: GridBuild): GridBuild => {
  const newGrid = fullGrid.map(row => [...row]);
  
  for (let row = 0; row < TOTAL_GRID_ROWS; row++) {
    for (let col = 0; col < COLS_BUILD; col++) {
      const neighbors = countNeighborsBuild(fullGrid, row, col);
      const isAlive = fullGrid[row][col];
      
      if (isAlive && (neighbors === 2 || neighbors === 3)) {
        newGrid[row][col] = true;
      } else if (!isAlive && neighbors === 3) {
        newGrid[row][col] = true;
      } else {
        newGrid[row][col] = false;
      }
    }
  }
  
  return newGrid;
};

const drawGridBuild = (
  ctx: CanvasRenderingContext2D,
  filledRows: GridBuild,
  fullGrid: GridBuild,
  viewportOffset: number,
  canvasHeight: number
) => {
  ctx.fillStyle = "#f5f5f5";
  ctx.fillRect(0, 0, CANVAS_WIDTH_BUILD, canvasHeight);
  
  // Draw filled rows at the top (in gray)
  for (let row = 0; row < filledRows.length; row++) {
    for (let col = 0; col < COLS_BUILD; col++) {
      if (filledRows[row][col]) {
        const x = col * CELL_SIZE_BUILD + CELL_SIZE_BUILD / 2;
        const y = row * CELL_SIZE_BUILD + CELL_SIZE_BUILD / 2;
        const radius = CELL_SIZE_BUILD / 2 - 2;
        
        ctx.fillStyle = "#999";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
  
  // Draw visible portion of the full grid below filled rows (in black)
  for (let visibleRow = 0; visibleRow < VISIBLE_ROWS_BUILD; visibleRow++) {
    const gridRow = viewportOffset + visibleRow;
    if (gridRow >= TOTAL_GRID_ROWS) break;
    
    const displayRow = filledRows.length + visibleRow;
    for (let col = 0; col < COLS_BUILD; col++) {
      if (fullGrid[gridRow][col]) {
        const x = col * CELL_SIZE_BUILD + CELL_SIZE_BUILD / 2;
        const y = displayRow * CELL_SIZE_BUILD + CELL_SIZE_BUILD / 2;
        const radius = CELL_SIZE_BUILD / 2 - 2;
        
        ctx.fillStyle = "#000";
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, 2 * Math.PI);
        ctx.fill();
      }
    }
  }
};

function BuildingRowsConway() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [filledRows, setFilledRows] = useState<GridBuild>([]);
  const [fullGrid, setFullGrid] = useState<GridBuild>(createRandomGridBuild);
  const [viewportOffset, setViewportOffset] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [generation, setGeneration] = useState(0);
  const [speed, setSpeed] = useState(8);
  const animationFrameRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);

  const totalRows = filledRows.length + VISIBLE_ROWS_BUILD;
  const canvasHeight = totalRows * CELL_SIZE_BUILD;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    drawGridBuild(ctx, filledRows, fullGrid, viewportOffset, canvasHeight);
  }, [filledRows, fullGrid, viewportOffset, canvasHeight]);

  useEffect(() => {
    if (!isPlaying) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      return;
    }

    const animate = (timestamp: number) => {
      const interval = 1000 / speed;
      
      if (timestamp - lastUpdateRef.current >= interval) {
        setFullGrid(prevGrid => computeNextGenerationBuild(prevGrid));
        setGeneration(prev => prev + 1);
        lastUpdateRef.current = timestamp;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isPlaying, speed]);

  const handleAddRow = () => {
    if (viewportOffset + VISIBLE_ROWS_BUILD < TOTAL_GRID_ROWS) {
      // Add a filled row at the top
      setFilledRows(prev => [...prev, createFilledRow()]);
      // Shift viewport down by 1
      setViewportOffset(prev => prev + 1);
    }
  };

  const handleReset = () => {
    setFilledRows([]);
    setFullGrid(createEmptyGridBuild());
    setViewportOffset(0);
    setGeneration(0);
    setIsPlaying(false);
  };

  const handleRandomize = () => {
    setFilledRows([]);
    setFullGrid(createRandomGridBuild());
    setViewportOffset(0);
    setGeneration(0);
  };

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH_BUILD}
          height={canvasHeight}
          style={{
            border: "2px solid #000",
            borderRadius: "8px",
            backgroundColor: "#f5f5f5",
          }}
        />
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div style={{ textAlign: "center", fontSize: "16px" }}>
          Generation: <strong>{generation}</strong> | Total rows: <strong>{totalRows}</strong> | Filled rows: <strong>{filledRows.length}</strong> | Viewing grid rows: <strong>{viewportOffset}-{viewportOffset + VISIBLE_ROWS_BUILD - 1}</strong>
        </div>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: isPlaying ? "#000" : "#fff",
              color: isPlaying ? "#fff" : "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>

          <button
            onClick={handleAddRow}
            disabled={viewportOffset + VISIBLE_ROWS_BUILD >= TOTAL_GRID_ROWS}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: viewportOffset + VISIBLE_ROWS_BUILD >= TOTAL_GRID_ROWS ? "not-allowed" : "pointer",
              opacity: viewportOffset + VISIBLE_ROWS_BUILD >= TOTAL_GRID_ROWS ? 0.5 : 1,
              fontWeight: "bold",
            }}
          >
            Add Filled Row ↓
          </button>

          <button
            onClick={handleRandomize}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Randomize
          </button>

          <button
            onClick={handleReset}
            style={{
              padding: "12px 24px",
              fontSize: "14px",
              fontFamily: "monospace",
              backgroundColor: "#fff",
              color: "#000",
              border: "2px solid #000",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Clear
          </button>
        </div>

        <div style={{ textAlign: "center" }}>
          <label style={{ display: "block", marginBottom: "10px", fontSize: "14px" }}>
            Speed: {speed} generations/sec
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ width: "300px" }}
          />
        </div>
      </div>

      <div
        style={{
          maxWidth: "800px",
          margin: "40px auto 0",
          padding: "20px",
          backgroundColor: "#f5f5f5",
          border: "2px solid #000",
          borderRadius: "12px",
          fontSize: "12px",
          lineHeight: "1.6",
        }}
      >
        <h3 style={{ marginBottom: "10px", fontSize: "14px", fontWeight: "bold" }}>
          Building Rows (Inverted Tetris)
        </h3>
        <p style={{ marginBottom: "10px" }}>
          This version runs a full 60-row Conway grid, but only 4 rows are visible at a time. Each time you click "Add Filled Row":
        </p>
        <ul style={{ marginLeft: "20px" }}>
          <li style={{ marginBottom: "8px" }}>
            A new row filled with dots appears at the top (shown in gray)
          </li>
          <li style={{ marginBottom: "8px" }}>
            The viewport shifts down by 1 row in the underlying Conway grid
          </li>
          <li style={{ marginBottom: "8px" }}>
            The canvas grows taller to accommodate all filled rows
          </li>
          <li style={{ marginBottom: "8px" }}>
            Filled rows are static and don't participate in the simulation
          </li>
          <li style={{ marginBottom: "8px" }}>
            The full 60-row grid continues to evolve
          </li>
          <li>
            Like scrolling through Conway while building static rows downward!
          </li>
        </ul>
      </div>
    </div>
  );
}

