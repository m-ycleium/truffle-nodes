"use client";

import { useRef, useEffect } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  type Vertex = {
    x: number;
    y: number;
    r: number;
  };

  type Edge = {
    v1: Vertex;
    v2: Vertex;
  };

  function drawVertex(v: Vertex, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.arc(v.x, v.y, v.r, 0, 2 * Math.PI);
    ctx.fill();
  }

  function drawEdge(e: Edge, ctx: CanvasRenderingContext2D) {
    ctx.beginPath();
    ctx.moveTo(e.v1.x, e.v1.y);
    ctx.lineTo(e.v2.x, e.v2.y);
    ctx.stroke();
  }

  const testV: Vertex[] = [
    { x: 10, y: 10, r: 10 },
    { x: 100, y: 100, r: 10 },
  ];

  const testE: Edge[] = [{ v1: testV[0], v2: testV[1] }];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let i = 0; i < testV.length; i++) {
      drawVertex(testV[i], ctx);
    }

    for (let i = 0; i < testE.length; i++) {
      drawEdge(testE[i], ctx);
    }
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{ border: "1px solid black" }}
    ></canvas>
  );
}
