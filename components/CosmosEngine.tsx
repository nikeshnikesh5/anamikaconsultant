"use client";

import { useEffect } from "react";

/** Boots the GSAP + Pixi experience after the markup has hydrated. Renders nothing. */
export default function CosmosEngine() {
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      const [{ default: gsap }, PIXI, { startCosmos }] = await Promise.all([
        import("gsap"),
        import("pixi.js"),
        import("@/lib/cosmos-engine"),
      ]);
      if (cancelled) return;
      cleanup = startCosmos(gsap, PIXI);
    })();

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}
