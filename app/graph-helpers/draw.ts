import { type Vertex, type Edge, GravityBasin } from "./types";
import { vertexRadius, subGraphVertexRadius, anchorRadius } from "../page";

export const baseColor = "#FFFFFF99";
export const anchorColor = "#FFFFFF";
export const subGraphColor = "#FFFFFF66";
export const bridgeColor = "#FFFFFF22";

export function drawVertex(v: Vertex, ctx: CanvasRenderingContext2D) {
  if (v.r === vertexRadius) {
    ctx.fillStyle = baseColor;
  } else if (v.r === anchorRadius) {
    ctx.fillStyle = anchorColor;
  } else {
    ctx.fillStyle = subGraphColor;
  }

  ctx.beginPath();
  ctx.arc(v.x, v.y, v.r, 0, 2 * Math.PI);
  ctx.fill();
}

export function drawEdge(e: Edge, ctx: CanvasRenderingContext2D) {
  if (e.v1.r === subGraphVertexRadius && e.v2.r === subGraphVertexRadius) {
    ctx.strokeStyle = subGraphColor;
  } else if (
    e.v1.r === subGraphVertexRadius ||
    e.v2.r === subGraphVertexRadius
  ) {
    ctx.strokeStyle = bridgeColor;
  } else {
    ctx.strokeStyle = baseColor;
  }

  ctx.beginPath();
  ctx.moveTo(e.v1.x, e.v1.y);
  ctx.lineTo(e.v2.x, e.v2.y);
  ctx.stroke();
}

export function drawGravityBasin(
  g: GravityBasin,
  ctx: CanvasRenderingContext2D
) {
  ctx.strokeStyle = baseColor;
  ctx.beginPath();
  ctx.arc(g.x, g.y, g.r, 0, 2 * Math.PI);
  ctx.stroke();
}

export function drawGravityBasins(
  G: GravityBasin[],
  ctx: CanvasRenderingContext2D
) {
  for (let i = 0; i < G.length; i++) {
    drawGravityBasin(G[i], ctx);
  }
}

export function drawGraph(
  vertices: Vertex[],
  edges: Edge[],
  ctx: CanvasRenderingContext2D
) {
  for (let i = 0; i < edges.length; i++) {
    drawEdge(edges[i], ctx);
  }
  for (let i = 0; i < vertices.length; i++) {
    // draw backwards to alwasy put root on top
    drawVertex(vertices[vertices.length - 1 - i], ctx);
  }
}
