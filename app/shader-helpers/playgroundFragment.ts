"use client";

export default `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;

#define NUM_ROWS 2
#define NUM_DOTS 16
#define DOT_RADIUS 0.01
#define ROD_INFLUENCE 0.1
#define ROD_RADIUS 0.02

// SDF for sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// SDF for infinite vertical cylinder (rod)
float sdCylinder(vec3 p, vec2 pos, float r) {
  return length(p.xy - pos) - r;
}

// Smooth minimum with exponential falloff (softmax-like)
float smin(float a, float b, float k) {
  float h = max(k - abs(a - b), 0.0) / k;
  return min(a, b) - h * h * k * 0.25;
}

// Scene definition with grid of dots and invisible rod influence
float map(vec3 p) {
  float d = 1e10;
  
  // Grid parameters - constrain to canvas
  float maxWidth = 0.8;  // Max width to keep dots in view
  float rowSpacing = 0.2; // Fixed vertical spacing between rows
  
  float spacingX = NUM_DOTS > 1 ? maxWidth / float(NUM_DOTS - 1) : 0.0;
  
  float gridWidth = float(NUM_DOTS - 1) * spacingX;
  float gridHeight = float(NUM_ROWS - 1) * rowSpacing;
  
  // Oscillating rod position
  float rodX = sin(iTime * 1.5) * (gridWidth * 0.55);
  vec2 rodPos = vec2(rodX, 0.0);
  
  // Create grid of dots
  for (int row = 0; row < NUM_ROWS; row++) {
    // Center rows vertically around y=0
    float y = gridHeight > 0.0 ? -gridHeight * 0.5 + float(row) * rowSpacing : 0.0;
    
    for (int col = 0; col < NUM_DOTS; col++) {
      // Center dots horizontally around x=0
      float x = gridWidth > 0.0 ? -gridWidth * 0.5 + float(col) * spacingX : 0.0;
      vec3 dotPos = vec3(x, y, 0.0);
      
      // Distance to this dot
      float dotDist = sdSphere(p - dotPos, DOT_RADIUS);
      
      // Calculate influence from the rod
      float distToRod = length(vec2(x, y) - rodPos);
      float influence = exp(-distToRod * distToRod / (ROD_INFLUENCE * ROD_INFLUENCE));
      
      // Apply smooth minimum based on rod influence
      float modifiedDist = dotDist - influence * 0.15;
      
      d = smin(d, modifiedDist, 0.02);
    }
  }
  
  // Add the rod cylinder (visible if ROD_RADIUS > 0)
  float rodDist = sdCylinder(p, rodPos, ROD_RADIUS);
  d = min(d, rodDist);
  
  return d;
}

// Simple raymarching with orthographic camera (no perspective)
vec3 raymarch(vec2 uv) {
  // Orthographic camera setup - rays are parallel, not converging
  vec3 ro = vec3(uv.x, uv.y, -2.0); // Ray origin (far back on Z axis)
  vec3 rd = vec3(0.0, 0.0, 1.0);     // Ray direction (straight forward, parallel rays)
  
  float t = 0.0;
  const int maxSteps = 64;
  const float maxDist = 10.0;
  
  for (int i = 0; i < maxSteps; i++) {
    vec3 p = ro + rd * t;
    float d = map(p);
    
    if (d < 0.001) {
      // Hit! Return flat color
      return vec3(1.0, 0.5, 0.5);
    }
    
    t += d;
    if (t > maxDist) break;
  }
  
  // Background
  return vec3(0.1, 0.1, 0.15);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec2 res = iResolution.xy;
  
  // Normalize coordinates to [-1, 1] range (centered)
  vec2 uv = (fragCoord - 0.5 * res) / res.y;
  
  vec3 col = raymarch(uv);
  
  gl_FragColor = vec4(col, 1.0);
}
`;
