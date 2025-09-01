import { type Vertex, type Edge } from "./types";
import { createNoise2D } from "simplex-noise";

export const noise2D = createNoise2D();

export function getVertexDistance(v1: Vertex, v2: Vertex) {
  return Math.sqrt((v2.x - v1.x) ** 2 + (v2.y - v1.y) ** 2);
}

export function getEdges(vertices: Vertex[], minProximity: number) {
  let edges: Edge[] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = 0; j < vertices.length; j++) {
      if (i === j) continue;
      let v1 = vertices[i];
      let v2 = vertices[j];
      let d = getVertexDistance(v1, v2);
      if (d <= minProximity) {
        edges.push({ v1, v2 });
      }
    }
  }
  return edges;
}

export function seedVertices(
  vertices: Vertex[],
  numVertices: number,
  r: number,
  maxX: number,
  maxY: number
) {
  for (let i = 0; i < numVertices; i++) {
    vertices.push({
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      r: r,
    });
  }
}

export function noiseStep(vertices: Vertex[], time: number) {
  for (let i = 0; i < vertices.length; i++) {
    let curV = vertices[i];
    curV.x += noise2D(i, time / 3200) / 4;
    curV.y += noise2D(vertices.length - i, time / 3200) / 4;
  }
}

export function addVertex(vertices: Vertex[], newV: Vertex) {
  vertices.push(newV);
}

export function deleteVertex(vertices: Vertex[], index: number) {
  vertices.splice(index, 1);
}

// return index of first vertex colliding with point or -1
export function getCollidingVertexIndex(
  vertices: Vertex[],
  point: { x: number; y: number },
  tolerance: number
) {
  let index = -1;
  for (let i = 0; i < vertices.length; i++) {
    let curV = vertices[i];
    if (
      getVertexDistance(curV, { x: point.x, y: point.y, r: 0 }) <= tolerance
    ) {
      index = i;
      break;
    }
  }
  return index;
}
