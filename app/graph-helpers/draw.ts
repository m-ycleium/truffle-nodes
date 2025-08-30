import { type Vertex, type Edge } from "./types";

export function drawVertex(v: Vertex, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.arc(v.x, v.y, v.r, 0, 2 * Math.PI);
  ctx.fill();
}

export function drawEdge(e: Edge, ctx: CanvasRenderingContext2D) {
  ctx.beginPath();
  ctx.moveTo(e.v1.x, e.v1.y);
  ctx.lineTo(e.v2.x, e.v2.y);
  ctx.stroke();
}

export function drawGraph(
  vertices: Vertex[],
  edges: Edge[],
  ctx: CanvasRenderingContext2D
) {
  for (let i = 0; i < vertices.length; i++) {
    drawVertex(vertices[i], ctx);
  }

  for (let i = 0; i < edges.length; i++) {
    drawEdge(edges[i], ctx);
  }
}
