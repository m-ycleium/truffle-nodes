"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  getEdges,
  seedVertices,
  addVertex,
  getCollidingVertexIndex,
} from "./graph-helpers/utils";
import { drawVertex, drawEdge, drawGraph } from "./graph-helpers/draw";
import { type Vertex, type Edge } from "./graph-helpers/types";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const edgeProximity = 50;
  const vertexRadius = 4;
  const numSeededVertices = 100;
  const vertexClickRadius = 20;

  let testV: Vertex[] = [];
  let testE: Edge[] = [];

  useEffect(() => {
    // init
    seedVertices(testV, numSeededVertices, vertexRadius, 400, 400);
    testE = getEdges(testV, edgeProximity);

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("click", handleClick);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (timestamp: DOMHighResTimeStamp) => {
      animationFrameId.current = requestAnimationFrame(animate);

      // update edges every frame
      testE = getEdges(testV, edgeProximity);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGraph(testV, testE, ctx);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  const handleClick = useCallback(
    (event: MouseEvent) => {
      const collidingVertexIndex = getCollidingVertexIndex(
        testV,
        { x: event.offsetX, y: event.offsetY },
        vertexClickRadius
      );

      if (collidingVertexIndex === -1) {
        addVertex(testV, {
          x: event.offsetX,
          y: event.offsetY,
          r: vertexRadius,
        });
      }
    },
    [testV]
  );

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      style={{ border: "1px solid black" }}
    ></canvas>
  );
}
