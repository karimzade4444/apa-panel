"use client";

import { motion, useReducedMotion } from "motion/react";
import { useRef, type MouseEvent, type ReactNode } from "react";

import { useMouseParallax } from "@/features/auth/model/use-mouse-parallax";

interface LoginSceneProps {
  /** Левая часть (брендинг). Скрывается на мобильных. */
  left: ReactNode;
  /** Правая часть (карточка логина). */
  children: ReactNode;
}

export default function LoginScene({ left, children }: LoginSceneProps) {
  const sceneRef = useRef<HTMLElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Три слоя с разной глубиной: чем больше |strength|, тем сильнее смещение.
  // Знак задаёт направление: фон «уходит» от курсора, передний план — навстречу.
  const bg = useMouseParallax({ strength: 22, stiffness: 48, damping: 20 });
  const leftLayer = useMouseParallax({ strength: -10, stiffness: 60, damping: 18 });
  const card = useMouseParallax({ strength: -6, stiffness: 70, damping: 18 });

  const handleMouseMove = (e: MouseEvent<HTMLElement>) => {
    if (shouldReduceMotion || !sceneRef.current) return;
    const rect = sceneRef.current.getBoundingClientRect();
    bg.setFromPointer(e.clientX, e.clientY, rect);
    leftLayer.setFromPointer(e.clientX, e.clientY, rect);
    card.setFromPointer(e.clientX, e.clientY, rect);
  };

  const handleMouseLeave = () => {
    bg.reset();
    leftLayer.reset();
    card.reset();
  };

  return (
    <main
      ref={sceneRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#031426] px-4 py-10 lg:px-12"
    >
      {/* Фон: медленное «приближение» при загрузке + параллакс */}
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 bg-cover bg-center"
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 1.2 }}
        animate={{ opacity: 1, scale: 1.08 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
        style={{
          backgroundImage: "url('/images/login/academy-background.jpg')",
          x: bg.x,
          y: bg.y,
          filter: "saturate(1.1) contrast(1.04)",
        }}
      />

      {/* Затемнение и золотые подсветки */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,164,92,0.22),transparent_30%),linear-gradient(135deg,rgba(3,20,38,0.88),rgba(6,29,53,0.55),rgba(3,20,38,0.9))]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -top-40 h-[500px] w-[500px] rounded-full bg-[#c9a45c]/12 blur-[120px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-blue-400/10 blur-[120px]"
      />

      <div className="relative z-10 grid w-full max-w-[1280px] items-center gap-10 lg:grid-cols-2">
        <motion.div
          style={{ x: leftLayer.x, y: leftLayer.y }}
          className="hidden lg:block"
        >
          {left}
        </motion.div>

        <motion.div
          style={{ x: card.x, y: card.y }}
          className="mx-auto w-full max-w-[460px] lg:ml-auto lg:mr-0"
        >
          {children}
        </motion.div>
      </div>

      <p className="absolute bottom-5 left-6 z-10 text-xs text-white/60 lg:left-12">
        © 2026 Академия государственного управления. Все права защищены.
      </p>
    </main>
  );
}
