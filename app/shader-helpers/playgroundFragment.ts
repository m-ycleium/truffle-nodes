"use client";

export default `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;

// SDF for sphere
float sdSphere(vec3 p, float r) {
  return length(p) - r;
}

// Scene definition
float map(vec3 p) {
  float d = 1e10;
  
  // Central pulsing sphere
  float radius = 0.3 + 0.1 * sin(iTime);
  d = min(d, sdSphere(p, radius));
  
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
