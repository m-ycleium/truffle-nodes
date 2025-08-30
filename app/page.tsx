'use client'

import { useRef, useEffect } from 'react';

export default function Home() {
  
  const canvasRef = useRef<HTMLCanvasElement | null> (null);
  
  useEffect(() => {
    const canvas  = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.beginPath();
    ctx.moveTo(0,0);
    ctx.lineTo(400, 400);
    ctx.stroke();
  }, []);

  return (
    <canvas 
      ref={canvasRef}
      width={400}
      height={400}
      style={{ border: '1px solid black' }}
    ></canvas>
  );
}
