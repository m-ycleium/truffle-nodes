"use client";

import PlaygroundShaderCanvas from "../shader-helpers/playgroundShaderCanvas";

export default function Playground() {
  return (
    <div
      style={{
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        borderRadius: 33,
        overflow: "hidden",
        width: 500,
        height: 500,
      }}
    >
      <PlaygroundShaderCanvas />
    </div>
  );
}

