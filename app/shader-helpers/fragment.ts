"use client";

export default `
uniform vec2 iResolution;
uniform float iTime;
#define OCTAVES 4

float noise (vec2 p) {
  return 0.0;
}

float fbm(vec2 p) {
  float dampenFactor = 0.5;
  float range = 15.0;
  float f = 0.0, a = 1.0;
  for (int i = 0; i < OCTAVES; i++) {
    f += a*noise(p);
    p = 2.0 * p + range;
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

  vec2 flow = vec2(fbm(p + iTime), fbm(p - iTime)); 


  float smoke = fbm(flow + iTime);

  //fragColor = vec4(vec3(smoke), 1.0);

  fragColor = vec4(0., 1.0, 0., 1.);
  gl_FragColor = fragColor;
}
`;
