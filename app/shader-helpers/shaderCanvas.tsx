"use client";

import { useRef, useEffect, RefObject } from "react";
import * as THREE from "three";
import smoke from "./fragment";
import { type Vertex } from "../graph-helpers/types";

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

type ShaderCanvasProps = {
  mousePosRef: RefObject<{ x: number; y: number }>;
  VRef: RefObject<Vertex[]>;
  maxPoints: number;
};

function ShaderCanvas({ mousePosRef, VRef, maxPoints }: ShaderCanvasProps) {
  const canvasRefs = useRef<HTMLCanvasElement | null>(null);
  const animationFrameId = useRef<number | null>(null);

  const uVerticesArrayRef = useRef<THREE.Vector2[]>(
    Array.from({ length: maxPoints }, () => new THREE.Vector2(0, 0))
  );

  // necessary to avoid remaking the array which trips up GLSL
  const setVertices = (pts?: Array<{ x: number; y: number }>) => {
    const arr = uVerticesArrayRef.current;
    const n = Math.min(pts?.length ?? 0, arr.length);
    for (let i = 0; i < n; i++) {
      arr[i].set(pts![i].x, pts![i].y);
    }
    for (let i = n; i < arr.length; i++) {
      arr[i].set(0, 0);
    }
    return n;
  };

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
        iMouse: { value: new THREE.Vector2(0, 0) },
        iTime: { value: 0 },
        uVertices: { value: uVerticesArrayRef.current },
        uNumVertices: { value: 20 },
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
      material.uniforms.iTime.value = timestamp / 1000;
      material.uniforms.iMouse.value.x = mousePosRef.current.x;
      material.uniforms.iMouse.value.y = mousePosRef.current.y;
      const count = setVertices(VRef.current ?? []);
      material.uniforms.uNumVertices.value = count;
      renderer.render(scene, camera);
    };

    animationFrameId.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return <canvas ref={canvasRefs} width={500} height={500}></canvas>;
}

export default ShaderCanvas;
