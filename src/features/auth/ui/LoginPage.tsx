"use client";

/**
 * Установка:  npm i framer-motion lucide-react
 * Tailwind CSS уже должен быть в проекте.
 * Фон положите в /public/login-bg.jpg
 * Использование: app/login/page.tsx -> export { default } from "@/components/LoginPage";
 */

import { useEffect, useState } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  AnimatePresence,
  type Variants,
} from "framer-motion";
import {
  User, Lock, Eye, EyeOff, X, LogIn, ShieldCheck, Sun, Moon,
  GraduationCap, BookOpen, Landmark, Loader2, Check,
} from "lucide-react";

const GOLD = "#e8c46a";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.25 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { type: "spring", stiffness: 120, damping: 18 },
  },
};

export default function LoginPage() {
  const reduce = useReducedMotion();
  const [dark, setDark] = useState(true);
  const [login, setLogin] = useState("");
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [status, setStatus] = useState<"idle" | "loading" | "done">("idle");

  // --- Параллакс: нормализованная позиция мыши от -0.5 до 0.5 ---
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 18 });
  const sy = useSpring(my, { stiffness: 60, damping: 18 });

  useEffect(() => {
    if (reduce) return;
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [reduce, mx, my]);

  // Слои двигаются с разной глубиной
  const bgX = useTransform(sx, [-0.5, 0.5], [25, -25]);
  const bgY = useTransform(sy, [-0.5, 0.5], [15, -15]);
  const leftX = useTransform(sx, [-0.5, 0.5], [-14, 14]);
  const leftY = useTransform(sy, [-0.5, 0.5], [-8, 8]);
  const cardX = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const cardY = useTransform(sy, [-0.5, 0.5], [6, -6]);
  // 3D-наклон карточки
  const rotY = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const rotX = useTransform(sy, [-0.5, 0.5], [4, -4]);
  // Блик, следующий за мышью
  const glowX = useTransform(sx, [-0.5, 0.5], ["20%", "80%"]);
  const glowY = useTransform(sy, [-0.5, 0.5], ["10%", "90%"]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (status !== "idle") return;
    setStatus("loading");
    // TODO: заменить на реальный запрос (signIn / fetch)
    await new Promise((r) => setTimeout(r, 1600));
    setStatus("done");
    setTimeout(() => setStatus("idle"), 1800);
  };

  const glass = dark
    ? "bg-white/[0.07] border-white/20 text-white"
    : "bg-white/50 border-white/70 text-slate-900";
  const field = dark
    ? "bg-white/[0.06] border-white/20 focus-within:border-[#e8c46a]/80 focus-within:bg-white/10"
    : "bg-white/60 border-slate-300/60 focus-within:border-amber-500 focus-within:bg-white/80";
  const muted = dark ? "text-white/70" : "text-slate-600";

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-slate-900 font-sans">
      {/* ФОН (самый глубокий слой, увеличен, чтобы не было краёв при сдвиге) */}
      <motion.div
        aria-hidden
        className="absolute -inset-12 bg-cover bg-center"
        style={{ backgroundImage: "url(/login-bg.jpg)", x: bgX, y: bgY }}
        initial={{ scale: 1.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
      />
      {/* затемнение под тему */}
      <div
        aria-hidden
        className={`absolute inset-0 transition-colors duration-700 ${
          dark
            ? "bg-linear-to-br from-slate-950/70 via-slate-900/30 to-slate-950/70"
            : "bg-linear-to-br from-white/50 via-white/10 to-sky-100/40"
        }`}
      />

      {/* золотые дуги по углам */}
      <motion.svg
        aria-hidden
        viewBox="0 0 400 400"
        className="pointer-events-none absolute -left-10 -top-10 h-105 w-105"
        style={{ x: leftX, y: leftY }}
      >
        <motion.path
          d="M0 330 C 160 300, 330 160, 380 0"
          fill="none" stroke={GOLD} strokeWidth="1.5" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.8 }}
          transition={{ duration: 2.2, delay: 0.4, ease: "easeInOut" }}
        />
      </motion.svg>

      {/* переключатель темы */}
      <button
        onClick={() => setDark((d) => !d)}
        aria-label="Сменить тему"
        className={`absolute right-6 top-6 z-20 flex rounded-full border p-1 backdrop-blur-xl ${glass}`}
      >
        <span className="relative flex">
          <motion.span
            layout
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="absolute inset-y-0 w-9 rounded-full bg-white/25"
            style={{ left: dark ? "50%" : 0 }}
          />
          <Sun className="relative z-10 m-2 h-5 w-5" />
          <Moon className="relative z-10 m-2 h-5 w-5" />
        </span>
      </button>

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-2 lg:px-12">
        {/* ЛЕВАЯ ЧАСТЬ */}
        <motion.section
          style={{ x: leftX, y: leftY }}
          className="hidden flex-col items-center text-center lg:flex"
        >
          <motion.div
            variants={container} initial="hidden" animate="show"
            className="flex flex-col items-center"
          >
            <motion.div variants={item}>
              <Landmark
                className="h-24 w-24 drop-shadow-[0_0_24px_rgba(232,196,106,0.5)]"
                style={{ color: GOLD }} strokeWidth={1.2}
              />
            </motion.div>

            <motion.h1
              variants={item}
              className="mt-6 max-w-lg text-4xl font-semibold leading-tight text-white drop-shadow-lg"
            >
              Академия государственного управления при Президенте{" "}
              <span style={{ color: GOLD }}>Республики Таджикистан</span>
            </motion.h1>

            <motion.div variants={item} className="my-6 flex w-full max-w-md items-center gap-3">
              <span className="h-px flex-1 bg-linear-to-r from-transparent to-[#e8c46a]" />
              <span className="h-2.5 w-2.5 rotate-45 border" style={{ borderColor: GOLD }} />
              <span className="h-px flex-1 bg-linear-to-l from-transparent to-[#e8c46a]" />
            </motion.div>

            <motion.p variants={item} className="max-w-xs text-xl text-white/80">
              Единая система управления и развития Академии
            </motion.p>
          </motion.div>

          <motion.ul
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="mt-16 flex divide-x divide-white/20 rounded-2xl border border-white/20 bg-white/[0.07] px-2 py-4 text-left text-sm text-white backdrop-blur-xl"
          >
            {([
              [GraduationCap, "Образование и наука"],
              [BookOpen, "Профессиональное развитие"],
              [Landmark, "Служение государству"],
            ] as const).map(([Icon, label]) => (
              <li key={label} className="flex items-center gap-3 px-5">
                <Icon className="h-6 w-6 shrink-0" style={{ color: GOLD }} />
                <span className="max-w-36 leading-snug">{label}</span>
              </li>
            ))}
          </motion.ul>
        </motion.section>

        {/* КАРТОЧКА ЛОГИНА */}
        <div style={{ perspective: 1200 }} className="flex justify-center lg:justify-end">
          <motion.div
            style={{ x: cardX, y: cardY, rotateX: rotX, rotateY: rotY, transformStyle: "preserve-3d" }}
            initial={{ opacity: 0, y: 60, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 70, damping: 16, delay: 0.2 }}
            className={`relative w-full max-w-120 overflow-hidden rounded-[32px] border p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-2xl transition-colors duration-700 sm:p-10 ${glass}`}
          >
            {/* блик, следующий за курсором */}
            <motion.div
              aria-hidden
              className="pointer-events-none absolute h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-40 blur-3xl"
              style={{
                left: glowX, top: glowY,
                background: `radial-gradient(circle, ${GOLD}, transparent 70%)`,
              }}
            />
            {/* золотая кромка сверху */}
            <div className="absolute inset-x-10 top-0 h-px bg-linear-to-r from-transparent via-[#e8c46a] to-transparent" />

            <motion.form
              onSubmit={submit}
              variants={container} initial="hidden" animate="show"
              className="relative"
            >
              <motion.div variants={item} className="flex justify-center">
                <motion.div
                  animate={reduce ? {} : { y: [0, -4, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  style={{ translateZ: 40 }}
                  className="flex h-20 w-20 items-center justify-center rounded-full border border-[#e8c46a]/50 bg-[#e8c46a]/10 shadow-[0_0_40px_rgba(232,196,106,0.35)]"
                >
                  <BookOpen className="h-9 w-9" style={{ color: GOLD }} strokeWidth={1.4} />
                </motion.div>
              </motion.div>

              <motion.h2 variants={item} className="mt-5 text-center text-3xl font-semibold">
                Добро пожаловать!
              </motion.h2>
              <motion.p variants={item} className={`mt-1 text-center ${muted}`}>
                Войдите в административную панель
              </motion.p>

              <div className="mt-8 space-y-4">
                <motion.label
                  variants={item}
                  className={`flex h-14 items-center gap-3 rounded-2xl border px-4 transition-all duration-300 ${field}`}
                >
                  <User className={`h-5 w-5 ${muted}`} />
                  <input
                    value={login} onChange={(e) => setLogin(e.target.value)}
                    placeholder="Логин или email" autoComplete="username"
                    className="h-full flex-1 bg-transparent outline-none placeholder:opacity-60"
                  />
                  <AnimatePresence>
                    {login && (
                      <motion.button
                        type="button" onClick={() => setLogin("")} aria-label="Очистить"
                        initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                      >
                        <X className="h-5 w-5" />
                      </motion.button>
                    )}
                  </AnimatePresence>
                </motion.label>

                <motion.label
                  variants={item}
                  className={`flex h-14 items-center gap-3 rounded-2xl border px-4 transition-all duration-300 ${field}`}
                >
                  <Lock className={`h-5 w-5 ${muted}`} />
                  <input
                    type={show ? "text" : "password"}
                    value={pass} onChange={(e) => setPass(e.target.value)}
                    placeholder="Пароль" autoComplete="current-password"
                    className="h-full flex-1 bg-transparent outline-none placeholder:opacity-60"
                  />
                  <button
                    type="button" onClick={() => setShow((s) => !s)}
                    aria-label={show ? "Скрыть пароль" : "Показать пароль"}
                  >
                    {show ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                  </button>
                </motion.label>
              </div>

              <motion.div variants={item} className="mt-4 flex items-center justify-between text-sm">
                <button
                  type="button" onClick={() => setRemember((r) => !r)}
                  className="flex items-center gap-2"
                >
                  <span
                    className={`flex h-6 w-6 items-center justify-center rounded-md border transition-colors ${
                      remember ? "border-transparent bg-[#e8c46a]" : "border-white/40"
                    }`}
                  >
                    <AnimatePresence>
                      {remember && (
                        <motion.span
                          initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                        >
                          <Check className="h-4 w-4 text-slate-900" strokeWidth={3} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  Запомнить меня
                </button>
                <a href="/forgot-password" className="underline underline-offset-4" style={{ color: GOLD }}>
                  Забыли пароль?
                </a>
              </motion.div>

              <motion.button
                variants={item}
                type="submit"
                whileHover={reduce ? {} : { scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="group relative mt-6 flex h-14 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl text-lg font-semibold text-slate-900 shadow-[0_10px_30px_-8px_rgba(232,196,106,0.7)]"
                style={{ background: "linear-gradient(135deg,#f3d98b,#d9a93f 55%,#f0cd78)" }}
              >
                {/* бегущий блик */}
                <span className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 -skew-x-12 bg-white/50 blur-md transition-transform duration-700 group-hover:translate-x-[420%]" />
                <AnimatePresence mode="wait" initial={false}>
                  {status === "idle" && (
                    <motion.span key="i" className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <LogIn className="h-5 w-5" /> Войти в систему
                    </motion.span>
                  )}
                  {status === "loading" && (
                    <motion.span key="l" className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Loader2 className="h-5 w-5 animate-spin" /> Проверяем данные…
                    </motion.span>
                  )}
                  {status === "done" && (
                    <motion.span key="d" className="flex items-center gap-3"
                      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                      <Check className="h-5 w-5" strokeWidth={3} /> Добро пожаловать
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              <motion.div variants={item} className={`mt-6 flex items-center gap-3 text-sm ${muted}`}>
                <span className="h-px flex-1 bg-current opacity-20" />
                <ShieldCheck className="h-5 w-5" style={{ color: GOLD }} />
                Безопасный доступ
                <span className="h-px flex-1 bg-current opacity-20" />
              </motion.div>
            </motion.form>
          </motion.div>
        </div>
      </div>

      <p className="absolute bottom-5 left-6 z-10 text-xs text-white/70 lg:left-12">
        © 2025 Академия государственного управления. Все права защищены.
      </p>
    </main>
  );
}
