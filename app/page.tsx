"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  getEdges,
  seedVertices,
  addVertex,
  getCollidingVertexIndex,
  noiseStep,
} from "./graph-helpers/utils";
import ShaderCanvas from "./shader-helpers/shaderCanvas";
import { drawGraph } from "./graph-helpers/draw";
import { type Vertex, type Edge } from "./graph-helpers/types";
import gsap from "gsap";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  const edgeProximity = 100;
  const vertexRadius = 4;
  const numSeededVertices = 20;
  const vertexClickRadius = 10;
  const dragDelay = 0.48;

  let V: Vertex[] = [];
  let E: Edge[] = [];

  const VRef = useRef<Vertex[]>(V);

  // ref to avoid rerendering canvas
  const draggingVIndexRef = useRef<number>(-1);

  useEffect(() => {
    // init
    seedVertices(V, numSeededVertices, vertexRadius, 500, 500);
    E = getEdges(V, edgeProximity);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    addCanvasEventListeners(canvas);

    const animate = (timestamp: DOMHighResTimeStamp) => {
      animationFrameId.current = requestAnimationFrame(animate);

      // update edges every frame
      E = getEdges(V, edgeProximity);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      noiseStep(V, timestamp);
      VRef.current = V;
      drawGraph(V, E, ctx);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  function addCanvasEventListeners(canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleClick);
  }

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

  // todo fix bug where adds a node if you are dragging and the vertex hasn't caught up
  const handleMouseUp = useCallback(() => {
    draggingVIndexRef.current = -1;
  }, []);

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      mousePosRef.current = { x: event.offsetX, y: event.offsetY };
      if (draggingVIndexRef.current !== -1) {
        gsap.to(V[draggingVIndexRef.current], {
          duration: dragDelay,
          x: event.offsetX,
          y: event.offsetY,
        });
      }
    },
    [V]
  );

  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: 33,
        overflow: "hidden",
        width: 500,
        height: 500,
      }}
    >
      <canvas
        ref={canvasRef}
        width={500}
        height={500}
        style={{
          position: "absolute",
        }}
      ></canvas>
      <ShaderCanvas mousePosRef={mousePosRef} VRef={VRef}></ShaderCanvas>
    </div>
  );
}
