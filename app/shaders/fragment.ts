"use client";

export default `
void main() {
  vec2 fragCoord = glFragCoord.xy;
  vec4 fragColor;

  vec2 uv = fragCoord.xy / iResolution.xy;
  uv = uv * 2. - 1.;
  uv.x *= iResolution.x / iResolution.y;

  gl_FragColor = fragColor;
}
`;
