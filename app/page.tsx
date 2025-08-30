"use client";

import { useRef, useEffect } from "react";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const edgeProximity = 500;

  type Vertex = {
    x: number;
    y: number;
    r: number;
  };

  type Edge = {
    v1: Vertex;
    v2: Vertex;
  };

  function getVertexDistance(v1: Vertex, v2: Vertex) {
    return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
  }

  function getEdges(vertices: Vertex[], minProximity: number) {
    let edges: Edge[] = [];
    for (let i = 0; i < vertices.length; i++) {
      for (let j = 0; j < vertices.length; j++) {
        if (i === j) continue;
        let v1 = vertices[i];
        let v2 = vertices[j];
        let d = getVertexDistance(v1, v2);
        if (d <= minProximity) {
          edges.push({ v1, v2 });
        }
      }
    }
    return edges;
  }

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
    { x: 90, y: 10, r: 10 },
    { x: 100, y: 100, r: 10 },
    { x: 200, y: 200, r: 10 },
  ];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    for (let i = 0; i < testV.length; i++) {
      drawVertex(testV[i], ctx);
    }

    let testE = getEdges(testV, edgeProximity);

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
