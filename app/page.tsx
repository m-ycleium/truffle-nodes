"use client";

import { useRef, useEffect, useCallback, useState } from "react";
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
  const vertexClickRadius = 10;

  let V: Vertex[] = [];
  let E: Edge[] = [];

  // ref to avoid rerendering canvas
  const draggingVIndexRef = useRef<number>(-1);

  useEffect(() => {
    // init
    seedVertices(V, numSeededVertices, vertexRadius, 400, 400);
    E = getEdges(V, edgeProximity);

    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const animate = (timestamp: DOMHighResTimeStamp) => {
      animationFrameId.current = requestAnimationFrame(animate);

      // update edges every frame
      E = getEdges(V, edgeProximity);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGraph(V, E, ctx);
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
        V,
        { x: event.offsetX, y: event.offsetY },
        vertexClickRadius
      );

      if (collidingVertexIndex === -1) {
        addVertex(V, {
          x: event.offsetX,
          y: event.offsetY,
          r: vertexRadius,
        });
      }
    },
    [V]
  );

  const handleMouseDown = useCallback(
    (event: MouseEvent) => {
      const collidingVertexIndex = getCollidingVertexIndex(
        V,
        { x: event.offsetX, y: event.offsetY },
        vertexClickRadius
      );

      if (collidingVertexIndex !== -1) {
        draggingVIndexRef.current = collidingVertexIndex;
      }
    },
    [V]
  );

  const handleMouseUp = useCallback(() => {
    draggingVIndexRef.current = -1;
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (draggingVIndexRef.current !== -1) {
        V[draggingVIndexRef.current].x = event.offsetX;
        V[draggingVIndexRef.current].y = event.offsetY;
      }
    },
    [V]
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
