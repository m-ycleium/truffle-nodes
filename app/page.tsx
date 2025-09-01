"use client";

import { useRef, useEffect, useCallback } from "react";
import {
  getEdges,
  seedVertices,
  addVertex,
  getCollidingVertexIndex,
  noiseStep,
  deleteVertex,
  getDragPointWithPhysics,
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
  const numSeededVertices = 10;
  const vertexClickRadius = 40;
  const dragDelay = 0.48;
  const maxV = 64;

  let V: Vertex[] = [];
  let E: Edge[] = [];

  const VRef = useRef<Vertex[]>(V);

  // ref to avoid rerendering canvas
  const draggingVIndexRef = useRef<number>(-1);
  const isDraggingRef = useRef<boolean>(false);

  // todo: properly use this to improve delete vertex ux
  const dragTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
      if (dragTimeoutRef.current) clearTimeout(dragTimeoutRef.current);
    };
  }, []);

  function addCanvasEventListeners(canvas: HTMLCanvasElement) {
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mousemove", handleMouseMove);
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
        deleteVertex(V, collidingVertexIndex);
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
