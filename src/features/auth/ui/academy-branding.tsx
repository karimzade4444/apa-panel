"use client";

import { motion, useReducedMotion, type Variants } from "motion/react";
import { BriefcaseBusiness, GraduationCap, Landmark } from "lucide-react";

const features = [
  { icon: GraduationCap, label: "Образование\nи наука" },
  { icon: BriefcaseBusiness, label: "Профессиональное\nразвитие" },
  { icon: Landmark, label: "Служение\nгосударству" },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.3 } },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
  },
};

export default function AcademyBranding() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <motion.div
      variants={container}
      initial={shouldReduceMotion ? false : "hidden"}
      animate="show"
      className="flex flex-col items-center text-center"
    >
      {/* Замените на <Image> со зданием Академии, когда будет файл */}
      <motion.div variants={item}>
        <Landmark
          className="h-24 w-24 text-[#e0c17d] drop-shadow-[0_0_24px_rgba(212,175,98,0.5)]"
          strokeWidth={1.2}
        />
      </motion.div>

      <motion.h1
        variants={item}
        className="mt-6 max-w-lg text-3xl font-semibold leading-tight text-white drop-shadow-lg xl:text-4xl"
      >
        Академия государственного управления при Президенте
        <span className="block text-[#e0c17d]">Республики Таджикистан</span>
      </motion.h1>

      {/* Разделитель: линия «рисуется» от центра */}
      <motion.div variants={item} className="my-6 flex w-full max-w-md items-center gap-3">
        <motion.div
          className="h-px flex-1 origin-right bg-gradient-to-r from-transparent to-[#d4af62]"
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
        />
        <div className="h-2.5 w-2.5 rotate-45 border border-[#d4af62]" />
        <motion.div
          className="h-px flex-1 origin-left bg-gradient-to-l from-transparent to-[#d4af62]"
          initial={shouldReduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.9, ease: "easeOut" }}
        />
      </motion.div>

      <motion.p variants={item} className="max-w-xs text-xl leading-snug text-white/80">
        Единая система управления и развития Академии
      </motion.p>

      {/* Три направления */}
      <motion.ul
        variants={item}
        className="mt-14 flex divide-x divide-white/15 rounded-2xl border border-white/15 bg-white/[0.07] py-4 text-left text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.15)] backdrop-blur-xl"
      >
        {features.map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 px-5">
            <Icon className="h-6 w-6 shrink-0 text-[#d4af62]" />
            <span className="whitespace-pre-line leading-snug">{label}</span>
          </li>
        ))}
      </motion.ul>
    </motion.div>
  );
}
