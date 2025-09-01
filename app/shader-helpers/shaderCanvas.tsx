"use client";

import { useRef, useEffect, useCallback } from "react";
import * as THREE from "three";
import smoke from "./fragment";

const isWebGLAvailable = () => {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
    );
  } catch (e) {
    return false;
  }
};

function ShaderCanvas() {
  const canvasRefs = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    // init
    const canvas = canvasRefs.current;
    if (!canvas) return;

    if (!isWebGLAvailable()) {
      console.error("WebGL not supported");
      return;
    }

    const dpr = Math.min(2, window.devicePixelRatio || 1);

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: false });
    renderer.setPixelRatio(dpr);
    renderer.setSize(500, 500);
    const resolution = new THREE.Vector2(
      renderer.domElement.width,
      renderer.domElement.height
    );

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, 1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const material = new THREE.ShaderMaterial({
      uniforms: {
        iResolution: { value: resolution },
        iTime: { value: 0 },
      },
      vertexShader: `
        void main() {
          gl_Position = vec4(position, 1.0);
        }
      `,
      fragmentShader: smoke,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // todo: autoscale canvas
    const setSize = () => {
      renderer.setPixelRatio(dpr);
      renderer.setSize(500, 500);
      material.uniforms.iResolution.value.set();
    };

    const animate = (timestamp: DOMHighResTimeStamp) => {
      animationFrameId.current = requestAnimationFrame(animate);
      material.uniforms.iTime.value = timestamp;
      renderer.render(scene, camera);
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
