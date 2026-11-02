"use client";

import { useCallback } from "react";
import { useMotionValue, useSpring } from "motion/react";

interface UseMouseParallaxOptions {
  strength?: number;
  stiffness?: number;
  damping?: number;
}

export function useMouseParallax({
  strength = 1,
  stiffness = 70,
  damping = 18,
}: UseMouseParallaxOptions = {}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness, damping });
  const springY = useSpring(y, { stiffness, damping });

  const setFromPointer = useCallback(
    (clientX: number, clientY: number, rect: DOMRect) => {
      const normalizedX = (clientX - rect.left) / rect.width - 0.5;
      const normalizedY = (clientY - rect.top) / rect.height - 0.5;

      x.set(normalizedX * strength * 2);
      y.set(normalizedY * strength * 2);
    },
    [strength, x, y],
  );

  const reset = useCallback(() => {
    x.set(0);
    y.set(0);
  }, [x, y]);

  return {
    x: springX,
    y: springY,
    setFromPointer,
    reset,
  };
}
