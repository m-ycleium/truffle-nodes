"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  getEdges,
  seedVertices,
  addVertex,
  getCollidingVertexIndex,
  noiseStep,
  clearOffScreenVertices,
  getDragPointWithPhysics,
  explodeVertex,
  isVertexOffScreen,
  gravityStep,
} from "./graph-helpers/utils";
import ShaderCanvas from "./shader-helpers/shaderCanvas";
import { drawGraph, drawGravityBasins } from "./graph-helpers/draw";
import { type Vertex, type Edge, GravityBasin } from "./graph-helpers/types";
import gsap from "gsap";

export const edgeProximity = 100;
export const vertexRadius = 6;
export const numSeededVertices = 64;
export const vertexClickRadius = 40;
export const dragDelay = 0.48;
export const maxV = 128;
export const subGraphSize = 8;
export const subGraphVertexRadius = 4;
export const canvasWidth = 500;
export const canvasHeight = 500;

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const mousePosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  let V: Vertex[] = [];
  let E: Edge[] = [];
  let G: GravityBasin[] = [
    {
      x: canvasWidth / 2,
      y: canvasHeight / 2,
      r: 200,
      s: 10,
    },
  ];

  const VRef = useRef<Vertex[]>(V);

  // ref to avoid rerendering canvas
  const draggingVIndexRef = useRef<number>(-1);
  const isDraggingRef = useRef<boolean>(false);

  // todo: properly use this to improve delete vertex ux
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // init
    seedVertices(V, numSeededVertices, vertexRadius, canvasWidth, canvasHeight);
    E = getEdges(V, edgeProximity);

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    addMouseEventListeners();

    const animate = (timestamp: DOMHighResTimeStamp) => {
      animationFrameId.current = requestAnimationFrame(animate);

      // update edges every frame
      E = getEdges(V, edgeProximity);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      noiseStep(V, timestamp);
      gravityStep(V, G[0]);
      VRef.current = V;
      clearOffScreenVertices(V, canvasWidth, canvasHeight);
      drawGraph(V, E, ctx);
      //drawGravityBasins(G, ctx);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    };
  }, []);

  function addMouseEventListeners() {
    window.addEventListener("mousedown", handleMouseDown);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("mousemove", handleMouseMove);
  }

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

  const handleMouseUp = useCallback(
    (event: MouseEvent) => {
      const collidingVertexIndex = getCollidingVertexIndex(
        V,
        { x: event.offsetX, y: event.offsetY },
        vertexClickRadius
      );

      if (
        draggingVIndexRef.current == -1 &&
        collidingVertexIndex == -1 &&
        V.length < maxV
      ) {
        addVertex(V, {
          x: event.offsetX,
          y: event.offsetY,
          r: vertexRadius,
        });
      }

      if (!isDraggingRef.current && collidingVertexIndex != -1) {
        if (
          V[collidingVertexIndex].r === vertexRadius &&
          V.length + subGraphSize < maxV
        ) {
          explodeVertex(
            V,
            collidingVertexIndex,
            subGraphSize,
            subGraphVertexRadius
          );
        }
      }
      isDraggingRef.current = false;
      draggingVIndexRef.current = -1;
    },
    [V]
  );

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      mousePosRef.current = { x: event.offsetX, y: event.offsetY };
      if (draggingVIndexRef.current !== -1) {
        isDraggingRef.current = true;
        let dragPoint = { x: event.offsetX, y: event.offsetY };
        let physicsDragPoint = getDragPointWithPhysics(
          V,
          E,
          draggingVIndexRef.current,
          dragPoint
        );
        gsap.to(V[draggingVIndexRef.current], {
          duration: dragDelay,
          x: physicsDragPoint.x,
          y: physicsDragPoint.y,
          onUpdate: () => {
            if (
              isDraggingRef.current &&
              isVertexOffScreen(
                V[draggingVIndexRef.current],
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
      <ShaderCanvas
        mousePosRef={mousePosRef}
        VRef={VRef}
        maxPoints={maxV}
      ></ShaderCanvas>
    </div>
  );
}
