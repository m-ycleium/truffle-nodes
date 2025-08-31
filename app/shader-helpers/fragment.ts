"use client";

export default `
uniform vec2 iResolution;

void main() {
  vec2 fragCoord = gl_FragCoord.xy;
  vec4 fragColor;

  vec2 uv = fragCoord.xy / iResolution.xy;
  uv = uv * 2. - 1.;
  uv.x *= iResolution.x / iResolution.y;

  gl_FragColor = fragColor;
}
`;
