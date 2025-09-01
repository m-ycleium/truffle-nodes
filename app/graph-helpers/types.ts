export type Vertex = {
  x: number;
  y: number;
  r: number;
};

export type Edge = {
  v1: Vertex;
  v2: Vertex;
};

export type GravityBasin = {
  x: number;
  y: number;
  r: number;
  s: number;
};
