"use client";

import { useRef, useEffect } from "react";
import { getEdges, seedVertices } from "./graph-helpers/utils";
import { drawVertex, drawEdge } from "./graph-helpers/draw";
import { type Vertex, type Edge } from "./graph-helpers/types";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const edgeProximity = 50;
  const testV: Vertex[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    seedVertices(testV, 100, 4, 400, 400);

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
