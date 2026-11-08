

import Image from "next/image";
import { motion, useReducedMotion } from "motion/react";

export default function LoginHeader() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div className="mb-8 flex flex-col items-center text-center">
      <motion.div
        initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
        animate={
          shouldReduceMotion
            ? { opacity: 1, scale: 1 }
            : { opacity: 1, scale: 1, y: [0, -4, 0] }
        }
        transition={{
          opacity: { duration: 0.6, delay: 0.3 },
          scale: { duration: 0.6, delay: 0.3 },
          y: { duration: 4, repeat: Infinity, ease: "easeInOut", delay: 1 },
        }}
        className="relative mb-5 flex h-20 w-20 items-center justify-center rounded-full border border-[#d4af62]/50 bg-[#d4af62]/10 shadow-[0_0_40px_rgba(212,175,98,0.3)]"
      >
        <Image
          src="/images/login/logo.png"
          alt="Эмблема Академии"
          width={56}
          height={56}
          className="h-18 w-18 object-contain rounded-full"
          priority
        />
      </motion.div>

      <h2 className="text-3xl font-semibold tracking-tight text-white">
        Добро пожаловать!
      </h2>
      <p className="mt-2 text-white/65">Войдите в административную панель</p>
    </div>
  );
}
