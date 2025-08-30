import { type Vertex, type Edge } from "./types";

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
  verticesArray: Vertex[],
  numVertices: number,
  r: number,
  maxX: number,
  maxY: number
) {
  for (let i = 0; i < numVertices; i++) {
    verticesArray.push({
      x: Math.random() * maxX,
      y: Math.random() * maxY,
      r: r,
    });
  }
}
