"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import {
  getEdges,
  addVertex,
  getCollidingVertexIndex,
  getDragPointWithPhysics,
  explodeVertex,
  isVertexOffScreen,
} from "../graph-helpers/utils";
import { type Vertex, type Edge } from "../graph-helpers/types";
import gsap from "gsap";

type SamplingMode = "random" | "circle" | "figure8" | "julia" | "fibonacci";

export const edgeProximity = 100;
export const vertexRadius = 4;
export const anchorRadius = 16;
export const numSeededVertices = 48;
export const vertexClickRadius = 40;
export const dragDelay = 0.48;
export const maxV = 128;
export const subGraphSize = 8;
export const subGraphVertexRadius = 2;
export const canvasWidth = 500;
export const canvasHeight = 500;

// Black color scheme
const baseColor = "#000000";
const anchorColor = "#000000";
const subGraphColor = "#000000";
const bridgeColor = "#000000";

function drawVertex(v: Vertex, ctx: CanvasRenderingContext2D) {
  if (v.r === vertexRadius) {
    ctx.fillStyle = baseColor;
  } else if (v.r === anchorRadius) {
    ctx.fillStyle = anchorColor;
  } else {
    ctx.fillStyle = subGraphColor;
  }

  ctx.beginPath();
  ctx.arc(v.x, v.y, v.r, 0, 2 * Math.PI);
  ctx.fill();
}

function drawEdge(e: Edge, ctx: CanvasRenderingContext2D) {
  if (e.v1.r === subGraphVertexRadius && e.v2.r === subGraphVertexRadius) {
    ctx.strokeStyle = subGraphColor;
  } else if (
    e.v1.r === subGraphVertexRadius ||
    e.v2.r === subGraphVertexRadius
  ) {
    ctx.strokeStyle = bridgeColor;
  } else {
    ctx.strokeStyle = baseColor;
  }

  ctx.beginPath();
  ctx.moveTo(e.v1.x, e.v1.y);
  ctx.lineTo(e.v2.x, e.v2.y);
  ctx.stroke();
}

function drawGraph(
  vertices: Vertex[],
  edges: Edge[],
  ctx: CanvasRenderingContext2D
) {
  for (let i = 0; i < edges.length; i++) {
    drawEdge(edges[i], ctx);
  }
  for (let i = 0; i < vertices.length; i++) {
    drawVertex(vertices[vertices.length - 1 - i], ctx);
  }
}

// Sampling functions
function sampleRandom(
  count: number,
  width: number,
  height: number,
  radius: number
): Vertex[] {
  const vertices: Vertex[] = [];
  for (let i = 0; i < count; i++) {
    vertices.push({
      x: Math.random() * width,
      y: Math.random() * height,
      r: radius,
    });
  }
  return vertices;
}

function sampleCircle(
  count: number,
  width: number,
  height: number,
  radius: number
): Vertex[] {
  const vertices: Vertex[] = [];
  const circleRadius = Math.min(width, height) * 0.35;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    vertices.push({
      x: centerX + Math.cos(angle) * circleRadius,
      y: centerY + Math.sin(angle) * circleRadius,
      r: radius,
    });
  }
  return vertices;
}

function sampleFigure8(
  count: number,
  width: number,
  height: number,
  radius: number
): Vertex[] {
  const vertices: Vertex[] = [];
  const scale = Math.min(width, height) * 0.2;
  const centerX = width / 2;
  const centerY = height / 2;

  for (let i = 0; i < count; i++) {
    const t = (i / count) * Math.PI * 2;
    // Lemniscate of Gerono (figure-8)
    const x = centerX + scale * Math.cos(t);
    const y = centerY + scale * Math.sin(t) * Math.cos(t);
    vertices.push({ x, y, r: radius });
  }
  return vertices;
}

function sampleJulia(
  count: number,
  width: number,
  height: number,
  radius: number
): Vertex[] {
  const vertices: Vertex[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const scale = Math.min(width, height) * 0.15;

  // Julia set parameters
  const cReal = -0.7;
  const cImag = 0.27015;
  const maxIter = 30;
  const threshold = 4;

  // Sample points from the Julia set
  let samplesGenerated = 0;
  let attempts = 0;
  const maxAttempts = count * 100;

  while (samplesGenerated < count && attempts < maxAttempts) {
    attempts++;
    const x = (Math.random() - 0.5) * 4;
    const y = (Math.random() - 0.5) * 4;

    let zReal = x;
    let zImag = y;
    let iter = 0;

    for (; iter < maxIter; iter++) {
      const zReal2 = zReal * zReal - zImag * zImag;
      const zImag2 = 2 * zReal * zImag;
      zReal = zReal2 + cReal;
      zImag = zImag2 + cImag;

      if (zReal * zReal + zImag * zImag > threshold) break;
    }

    // Points that escape slowly or stay bounded are on the boundary
    if (iter > maxIter * 0.3 && iter < maxIter) {
      vertices.push({
        x: centerX + x * scale,
        y: centerY + y * scale,
        r: radius,
      });
      samplesGenerated++;
    }
  }

  // Fill remaining with random Julia boundary samples if needed
  while (vertices.length < count) {
    const angle = Math.random() * Math.PI * 2;
    const dist = 0.5 + Math.random() * 0.5;
    vertices.push({
      x: centerX + Math.cos(angle) * dist * scale * 3,
      y: centerY + Math.sin(angle) * dist * scale * 3,
      r: radius,
    });
  }

  return vertices;
}

function sampleFibonacci(
  count: number,
  width: number,
  height: number,
  radius: number
): Vertex[] {
  const vertices: Vertex[] = [];
  const centerX = width / 2;
  const centerY = height / 2;
  const goldenAngle = Math.PI * (3 - Math.sqrt(5)); // ~137.5 degrees

  for (let i = 0; i < count; i++) {
    const angle = i * goldenAngle;
    const radiusSpiral = Math.sqrt(i) * 8;
    vertices.push({
      x: centerX + Math.cos(angle) * radiusSpiral,
      y: centerY + Math.sin(angle) * radiusSpiral,
      r: radius,
    });
  }
  return vertices;
}

function sampleVertices(
  mode: SamplingMode,
  count: number,
  width: number,
  height: number,
  radius: number
): Vertex[] {
  switch (mode) {
    case "random":
      return sampleRandom(count, width, height, radius);
    case "circle":
      return sampleCircle(count, width, height, radius);
    case "figure8":
      return sampleFigure8(count, width, height, radius);
    case "julia":
      return sampleJulia(count, width, height, radius);
    case "fibonacci":
      return sampleFibonacci(count, width, height, radius);
    default:
      return sampleRandom(count, width, height, radius);
  }
}

function sampleVerticesWithScale(
  mode: SamplingMode,
  count: number,
  width: number,
  height: number,
  radius: number,
  scale: number
): Vertex[] {
  const vertices = sampleVertices(mode, count, width, height, radius);
  const centerX = width / 2;
  const centerY = height / 2;

  // Scale vertices relative to center
  return vertices.map((v) => ({
    x: centerX + (v.x - centerX) * scale,
    y: centerY + (v.y - centerY) * scale,
    r: v.r,
  }));
}

export default function NodesPlayground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const [samplingMode, setSamplingMode] = useState<SamplingMode>("random");
  const [nodeCount, setNodeCount] = useState<number>(48);
  const [shapeSize, setShapeSize] = useState<number>(1.0);

  // Store vertices in ref to persist across re-renders
  const VRef = useRef<Vertex[]>([]);
  const ERef = useRef<Edge[]>([]);

  // ref to avoid rerendering canvas
  const draggingVIndexRef = useRef<number>(-1);
  const isDraggingRef = useRef<boolean>(false);

  const initializeGraph = useCallback((mode: SamplingMode, count: number, size: number) => {
    // seed with central node
    const V: Vertex[] = [
      {
        x: canvasWidth / 2,
        y: canvasHeight / 2,
        r: anchorRadius,
      },
    ];

    // Add sampled vertices with size scaling
    const sampledVertices = sampleVerticesWithScale(
      mode,
      count,
      canvasWidth,
      canvasHeight,
      vertexRadius,
      size
    );
    V.push(...sampledVertices);

    VRef.current = V;
    ERef.current = getEdges(V, edgeProximity);
  }, []);

  useEffect(() => {
    initializeGraph(samplingMode, nodeCount, shapeSize);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      // update edges every frame
      ERef.current = getEdges(VRef.current, edgeProximity);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      // No noiseStep or gravityStep - positions stay static
      drawGraph(VRef.current, ERef.current, ctx);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [samplingMode, nodeCount, shapeSize, initializeGraph]);

  const handleMouseDown = useCallback((event: MouseEvent) => {
    const collidingVertexIndex = getCollidingVertexIndex(
      VRef.current,
      { x: event.offsetX, y: event.offsetY },
      vertexClickRadius
    );

    if (
      collidingVertexIndex !== -1 &&
      VRef.current[collidingVertexIndex].r !== anchorRadius
    ) {
      draggingVIndexRef.current = collidingVertexIndex;
    }
  }, []);

  const handleMouseUp = useCallback((event: MouseEvent) => {
    const collidingVertexIndex = getCollidingVertexIndex(
      VRef.current,
      { x: event.offsetX, y: event.offsetY },
      vertexClickRadius
    );

    if (
      draggingVIndexRef.current == -1 &&
      collidingVertexIndex == -1 &&
      VRef.current.length < maxV
    ) {
      addVertex(VRef.current, {
        x: event.offsetX,
        y: event.offsetY,
        r: vertexRadius,
      });
    }

    if (!isDraggingRef.current && collidingVertexIndex != -1) {
      if (
        VRef.current[collidingVertexIndex].r === vertexRadius &&
        VRef.current.length + subGraphSize < maxV
      ) {
        explodeVertex(
          VRef.current,
          collidingVertexIndex,
          subGraphSize,
          subGraphVertexRadius
        );
      }
    }
    isDraggingRef.current = false;
    draggingVIndexRef.current = -1;
  }, []);

  function getLocalPos(e: MouseEvent | PointerEvent) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }

  const handleMouseMove = useCallback((event: MouseEvent) => {
    if (draggingVIndexRef.current !== -1) {
      isDraggingRef.current = true;
      let dragPoint = getLocalPos(event);

      let physicsDragPoint = getDragPointWithPhysics(
        VRef.current,
        ERef.current,
        draggingVIndexRef.current,
        dragPoint
      );

      gsap.to(VRef.current[draggingVIndexRef.current], {
        duration: dragDelay,
        x: physicsDragPoint.x,
        y: physicsDragPoint.y,
        onUpdate: () => {
          if (
            isDraggingRef.current &&
            isVertexOffScreen(
              VRef.current[draggingVIndexRef.current],
              canvasWidth,
              canvasHeight
            )
          ) {
            draggingVIndexRef.current = -1;
            isDraggingRef.current = false;
          }
        },
      });
    }
  }, []);

  useEffect(() => {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [handleMouseDown, handleMouseUp, handleMouseMove]);

  const buttonStyle = (mode: SamplingMode) => ({
    padding: "10px 20px",
    margin: "5px",
    backgroundColor: samplingMode === mode ? "#000" : "#fff",
    color: samplingMode === mode ? "#fff" : "#000",
    border: "2px solid #000",
    borderRadius: "8px",
    cursor: "pointer",
    fontFamily: "monospace",
    fontSize: "14px",
    fontWeight: "bold" as const,
    transition: "all 0.2s ease",
  });

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        padding: "40px",
      }}
    >
      <div
        style={{
          marginBottom: "20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          gap: "10px",
        }}
      >
        <button
          style={buttonStyle("random")}
          onClick={() => setSamplingMode("random")}
        >
          Random
        </button>
        <button
          style={buttonStyle("circle")}
          onClick={() => setSamplingMode("circle")}
        >
          Circle
        </button>
        <button
          style={buttonStyle("figure8")}
          onClick={() => setSamplingMode("figure8")}
        >
          Figure-8
        </button>
        <button
          style={buttonStyle("julia")}
          onClick={() => setSamplingMode("julia")}
        >
          Julia Set
        </button>
        <button
          style={buttonStyle("fibonacci")}
          onClick={() => setSamplingMode("fibonacci")}
        >
          Fibonacci Spiral
        </button>
      </div>

      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "30px",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Node Count: {nodeCount}
          </label>
          <input
            type="range"
            min="5"
            max="200"
            value={nodeCount}
            onChange={(e) => setNodeCount(Number(e.target.value))}
            style={{
              width: "200px",
              cursor: "pointer",
            }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <label
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              fontWeight: "bold",
            }}
          >
            Shape Size: {shapeSize.toFixed(2)}x
          </label>
          <input
            type="range"
            min="0.2"
            max="2.0"
            step="0.1"
            value={shapeSize}
            onChange={(e) => setShapeSize(Number(e.target.value))}
            style={{
              width: "200px",
              cursor: "pointer",
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "relative",
          borderRadius: 33,
          overflow: "hidden",
          width: 500,
          height: 500,
          backgroundColor: "#ffffff",
          boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
        }}
      >
        <canvas ref={canvasRef} width={500} height={500}></canvas>
      </div>
    </div>
  );
}

