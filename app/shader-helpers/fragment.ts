"use client";

export default `
precision mediump float;
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;

#define OCTAVES 5
#define MAX_POINTS 64
uniform vec2 uVertices[MAX_POINTS];
uniform int uNumVertices;

float rand(vec2 p) {
  return fract(sin(dot(p, vec2(11., 32.))) * 11111.);
}

float noise (vec2 p) {
  vec2 seed = floor(p);
  vec2 f = fract(p);
  vec2 accum = f * f * (3.0 - 2.0 *f);
  float a = rand(seed + vec2(0,0));
  float b = rand(seed + vec2(1,0));
  float c = rand(seed + vec2(0,1));
  float d = rand(seed + vec2(1,1));
  return mix(mix(a,b,accum.x), mix(c,d,accum.x), accum.y);
}

float fbm(vec2 p) {
  float dampenFactor = 0.5;
  float range = 15.0;
  float f = 0.0, a = 0.5;
  float scale = 2.;
  for (int i = 0; i < OCTAVES; i++) {
    f += a*noise(p);
    p = scale * p + range;
    a *= dampenFactor;
  }
  return f;
}

vec3 displace(vec2 p, vec2 s, float dispScale) {
  vec2 r = p - s;
  float r2 = dot(r,r);
  float inf = exp(-r2/(2.0 * dispScale * dispScale));
  vec2 swirl= vec2(-r.y, r.x);
  return vec3(inf, inf * swirl);
}

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec4 fragColor;
  vec2 res = iResolution.xy;
  vec2 p = (fragCoord - 0.5*res) / res.y;
  vec2 m = (iMouse.xy - 0.5*res) / res.y;
  
  // account for flipped coordinate space
  m.y = 0. -m.y;

  vec2 flow = vec2(fbm(p*1.5 + 0.10*iTime), fbm(p*1.5 - 0.11*iTime));
  flow = p + 0.7*flow;
  
  vec3 disp = displace(p, m, 0.15);

  
  for (int i = 0; i <MAX_POINTS; i++) {
    if (i >= uNumVertices) break; 
    vec2 vP = (uVertices[i] - 0.5*res) / res.y;
    // account for flipped coordinate space
    vP.y = -vP.y;
    flow += 0.8 * displace(p, vP, 0.2).yz;
  }
    
  flow += 0.6 * disp.yz;

  float smoke = fbm(flow * 2. + iTime * 0.1);
  smoke = pow(smoke, 1.2);

  smoke += 0.3 * disp.x;

  
  for (int i = 0; i <MAX_POINTS; i++) {
    if (i >= uNumVertices) break; 
    vec2 vP = (uVertices[i] - 0.5*res) / res.y;
    // account for flipped coordinate space
    vP.y = -vP.y;
    smoke += 0.3 * displace(p, vP, 0.05).x;
  }
    
  fragColor = vec4(vec3(smoke * 2., smoke, smoke), 1.0);
  gl_FragColor = fragColor;
}
`;
