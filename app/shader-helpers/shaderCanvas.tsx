"use client";

import { useRef, useEffect, useCallback } from "react";

function ShaderCanvas() {
  const canvasRefs = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // init
    const canvas = canvasRefs.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) {
      console.error("WebGL not supported");
    } else {
      console.log(gl);
      console.log;
    }

    const animate = (timestamp: DOMHighResTimeStamp) => {
      animationFrameId.current = requestAnimationFrame(animate);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRefs}
      width={500}
      height={500}
      style={{ border: "1px solid black" }}
    ></canvas>
  );
}

export default ShaderCanvas;
