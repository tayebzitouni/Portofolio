import { useState, useEffect } from "react";

export function useWebGLSupported(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(null);

  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const ctx =
        canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl");
      setSupported(!!ctx);
      if (ctx && "getExtension" in ctx) {
        const ext = (ctx as WebGLRenderingContext).getExtension("WEBGL_lose_context");
        if (ext) ext.loseContext();
      }
    } catch {
      setSupported(false);
    }
  }, []);

  return supported;
}
