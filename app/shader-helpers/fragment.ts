"use client";

export default `
uniform vec2 iResolution;
uniform float iTime;
uniform vec2 iMouse;
#define OCTAVES 5

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

vec3 displace(vec2 p, vec2 m) {
  float dispScale = 0.15;
  vec2 r = p - m;
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
  m.y = 0. - m.y;

  vec2 flow = vec2(fbm(p*1.5 + 0.10*iTime), fbm(p*1.5 - 0.11*iTime));
  flow = p + 0.7*flow;
  
  vec3 disp = displace(p, m);
  flow += 0.6 * disp.yz;

  float smoke = fbm(flow * 2. + iTime * 0.1);
  smoke = pow(smoke, 1.2);

  smoke += 0.3 * disp.x;

  fragColor = vec4(vec3(smoke * 2., smoke, smoke), 1.0);
  gl_FragColor = fragColor;
}
`;
