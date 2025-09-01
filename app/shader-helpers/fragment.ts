"use client";

export default `
uniform vec2 iResolution;
uniform float iTime;
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

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec4 fragColor;

  vec2 uv = fragCoord.xy / iResolution.xy;
  uv = uv * 2. - 1.;
  uv.x *= iResolution.x / iResolution.y;
  
  vec2 p = uv;

  vec2 flow = vec2(fbm(p*1.5 + 0.10*iTime), fbm(p*1.5 - 0.11*iTime));
  flow   = p + 0.7*flow;    
  float smoke = fbm(flow * 2. + iTime * 0.1);

  smoke = pow(smoke, 1.2);

  fragColor = vec4(vec3(smoke), 1.0);
  gl_FragColor = fragColor;
}
`;
