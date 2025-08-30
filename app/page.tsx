"use client";

import { useRef, useEffect, useCallback } from "react";
import { getEdges, seedVertices, addVertex } from "./graph-helpers/utils";
import { drawVertex, drawEdge, drawGraph } from "./graph-helpers/draw";
import { type Vertex, type Edge } from "./graph-helpers/types";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const edgeProximity = 50;
  const vertexRadius = 4;
  const numSeededVertices = 100;

  const testV: Vertex[] = [];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener("click", handleClick);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    seedVertices(testV, numSeededVertices, vertexRadius, 400, 400);
    let testE = getEdges(testV, edgeProximity);

    drawGraph(testV, testE, ctx);
  }, []);

  const handleClick = useCallback((event: MouseEvent) => {
    addVertex(testV, { x: event.offsetX, y: event.offsetY, r: vertexRadius });
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
