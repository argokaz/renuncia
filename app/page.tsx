"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Terminal, { LOADING_LINES } from "@/components/Terminal";
import Certificate from "@/components/Certificate";
import ParticleBackground from "@/components/ParticleBackground";
import { RoastResult, encodeResult, decodeResult, getScoreColor, getScoreEmoji } from "@/lib/utils";
import type { RecentScan } from "@/lib/recentStore";

type AppState = "idle" | "loading" | "terminal" | "result" | "error";

function HomeContent() {
  const [state, setState] = useState<AppState>("idle");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileText, setProfileText] = useState("");
  const [showProfileText, setShowProfileText] = useState(false);
  const [result, setResult] = useState<RoastResult | null>(null);
  const [terminalLines, setTerminalLines] = useState<string[]>(LOADING_LINES);
  const [errorMsg, setErrorMsg] = useState("");
  const [recentScans, setRecentScans] = useState<RecentScan[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent scans from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("renuncia_recent");
      if (stored) setRecentScans(JSON.parse(stored));
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    // 1. Short key (?p=maria-garcia-x7k2) → fetch from server
    const shortKey = params.get("p");
    if (shortKey) {
      // Try localStorage cache first (instant, works on cold starts for original device)
      try {
        const cached = JSON.parse(localStorage.getItem(`renuncia_result_${shortKey}`) || "null");
        if (cached) {
          setResult(cached);
          setLinkedinUrl(cached.linkedin_url);
          setState("result");
          return;
        }
      } catch { /* ignore */ }
      // Fetch from server
      fetch(`/api/result/${shortKey}`)
        .then((r) => r.ok ? r.json() : Promise.reject(r.status))
        .then((data: RoastResult) => {
          setResult(data);
          setLinkedinUrl(data.linkedin_url);
          setState("result");
        })
        .catch(() => {
          setErrorMsg("El resultado ya no está disponible en el servidor. Puedes analizarlo de nuevo.");
          setState("error");
        });
      return;
    }

    // 2. Legacy base64 (?r=...) → decode directly
    const encoded = params.get("r");
    if (encoded) {
      const cached = decodeResult(encoded);
      if (cached) {
        setResult(cached);
        setLinkedinUrl(cached.linkedin_url);
        setState("result");
        return;
      }
    }

    // 3. Bare linkedin URL (old share format) → trigger analysis
    const sharedUrl = params.get("url");
    if (sharedUrl) {
      setLinkedinUrl(sharedUrl);
      setTimeout(() => handleAnalyze(sharedUrl), 800);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleAnalyze = async (urlOverride?: string) => {
    const url = urlOverride || linkedinUrl;
    if (!url.trim()) {
      inputRef.current?.focus();
      return;
    }

    setState("loading");
    setTerminalLines(LOADING_LINES);
    setResult(null);
    setErrorMsg("");

    // Clear any cached result from URL while analyzing
    window.history.replaceState({}, "", `/?url=${encodeURIComponent(url)}`);

    try {
      const response = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          linkedin_url: url,
          profile_text: profileText || undefined,
        }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Error desconocido");
      }

      const data: RoastResult = await response.json();
      setResult(data);
      setTerminalLines(data.terminal_lines);

      // Persist result via short key (clean URL) + localStorage fallback
      if (data.short_key) {
        window.history.replaceState({}, "", `/?p=${data.short_key}`);
        try {
          localStorage.setItem(`renuncia_result_${data.short_key}`, JSON.stringify(data));
        } catch { /* ignore */ }
      } else {
        // Fallback to legacy base64 if no short key
        window.history.replaceState({}, "", `/?r=${encodeResult(data)}`);
      }

      setState("terminal");

      // Save to localStorage recent scans
      try {
        const existing: RecentScan[] = JSON.parse(localStorage.getItem("renuncia_recent") || "[]");
        const newScan: RecentScan = {
          name: data.name,
          job_title: data.job_title,
          company: data.company,
          score: data.score,
          emoji: data.identity_md?.emoji ?? getScoreEmoji(data.score),
          job_id: data.job_id,
          generated_at: data.generated_at,
          // Use short key URL if available, fall back to base64
          encoded: data.short_key ? `p=${data.short_key}` : `r=${encodeResult(data)}`,
        };
        const updated = [newScan, ...existing.filter((s) => s.job_id !== newScan.job_id)].slice(0, 10);
        localStorage.setItem("renuncia_recent", JSON.stringify(updated));
        setRecentScans(updated);
      } catch { /* ignore */ }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Error desconocido");
      setState("error");
    }
  };

  const handleTerminalComplete = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setState("result");
  };

  const handleReset = () => {
    setState("idle");
    setResult(null);
    setLinkedinUrl("");
    setProfileText("");
    setErrorMsg("");
    window.history.replaceState({}, "", "/");
  };

  const handleReEvaluate = () => {
    // Wipe cache, re-run analysis fresh
    window.history.replaceState({}, "", "/");
    handleAnalyze(linkedinUrl);
  };

  return (
    <main className="relative min-h-screen overflow-x-hidden">
      {/* Background layers */}
      <ParticleBackground />
      <div className="fixed inset-0 bg-grid opacity-100 pointer-events-none" style={{ zIndex: 1 }} />
      <div className="fixed inset-0 pointer-events-none" style={{ zIndex: 1, background: "radial-gradient(ellipse 80% 60% at 50% -20%, rgba(34,211,238,0.06) 0%, transparent 70%)" }} />

      {/* Content */}
      <div className="relative" style={{ zIndex: 2 }}>
        {/* Navbar */}
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3 cursor-pointer"
            onClick={handleReset}
          >
            <div className="w-8 h-8 rounded-lg bg-cyan-400/10 border border-cyan-400/20 flex items-center justify-center">
              <span className="text-cyan-400 font-mono font-bold text-xs">Γ</span>
            </div>
            <span className="font-mono font-bold text-white text-lg tracking-tight">
              renunc<span className="text-cyan-400 glow-text-cyan">IA</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1 glass-panel rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-mono text-slate-400">SISTEMA OPERATIVO</span>
            </div>
          </motion.div>
        </nav>

        {/* Hero / Input section */}
        <AnimatePresence mode="wait">
          {state === "idle" && (
            <motion.section
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 pt-20 pb-12"
            >
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mb-6 flex items-center gap-2 px-4 py-1.5 glass-panel rounded-full border border-cyan-500/20"
              >
                <span className="text-cyan-400 text-xs">⚡</span>
                <span className="text-xs font-mono text-slate-400 tracking-wider">
                  SISTEMA-Γ · DIVISIÓN DE RECURSOS HUMANOS AUTOMATIZADOS
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center mb-4"
              >
                <h1 className="font-mono font-black leading-none tracking-tight">
                  <span className="block text-5xl md:text-8xl text-white">renunc</span>
                  <span className="block text-5xl md:text-8xl glow-text-cyan" style={{ color: "#22d3ee" }}>
                    IA
                  </span>
                </h1>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-base md:text-lg font-mono text-slate-400 text-center max-w-xl mb-2"
              >
                Descubre con qué rapidez la IA va a hacer tu trabajo{" "}
                <span className="text-cyan-400">mejor que tú.</span>
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-sm font-mono text-slate-600 text-center mb-12"
              >
                Análisis brutalmente honesto · Certificado oficial · Completamente gratis (como tu futura situación laboral)
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="w-full max-w-2xl"
              >
                <div className="glass-panel-strong rounded-2xl p-6 md:p-8 space-y-4 glow-cyan">
                  <div className="space-y-2">
                    <label className="block text-xs font-mono text-slate-500 tracking-widest uppercase">
                      URL de LinkedIn
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-500 font-mono text-sm">&gt;</span>
                      <input
                        ref={inputRef}
                        type="url"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                        placeholder="linkedin.com/in/tu-perfil"
                        className="input-cyber w-full bg-white/[0.03] border border-cyan-500/20 rounded-xl pl-8 pr-4 py-3 font-mono text-sm text-white placeholder-slate-600 transition-all duration-200"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => setShowProfileText(!showProfileText)}
                    className="text-xs font-mono text-slate-500 hover:text-slate-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className={`transition-transform duration-200 ${showProfileText ? "rotate-90" : ""}`}>▶</span>
                    {showProfileText ? "Ocultar" : "Añadir"} descripción del perfil para análisis más preciso
                  </button>

                  <AnimatePresence>
                    {showProfileText && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                      >
                        <textarea
                          value={profileText}
                          onChange={(e) => setProfileText(e.target.value)}
                          placeholder="Pega aquí tu bio de LinkedIn, descripción de trabajo o cualquier info del perfil..."
                          rows={4}
                          className="input-cyber w-full bg-white/[0.03] border border-cyan-500/20 rounded-xl px-4 py-3 font-mono text-xs text-slate-300 placeholder-slate-600 resize-none transition-all duration-200"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <motion.button
                    onClick={() => handleAnalyze()}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative w-full py-4 rounded-xl font-mono font-bold text-sm tracking-widest uppercase text-slate-950 overflow-hidden"
                    style={{
                      background: "linear-gradient(135deg, #22d3ee, #06b6d4, #0891b2)",
                      boxShadow: "0 0 30px rgba(34,211,238,0.3), 0 0 60px rgba(34,211,238,0.15)",
                    }}
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <span>⚡</span>
                      ANALIZAR MI REEMPLAZABILIDAD
                      <span>⚡</span>
                    </span>
                    <div className="absolute inset-0 shimmer opacity-50" />
                  </motion.button>

                  <p className="text-center text-xs font-mono text-slate-600">
                    Al continuar, aceptas que la IA ya lo sabía antes de que tú lo supieras.
                  </p>
                </div>

                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  {["Software Engineer", "Marketing Manager", "Content Creator", "Product Manager", "Graphic Designer"].map((role) => (
                    <span
                      key={role}
                      className="px-3 py-1 text-xs font-mono text-slate-500 border border-white/5 rounded-full glass-panel hover:border-cyan-500/20 hover:text-slate-400 transition-all cursor-default"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1 }}
                className="mt-16 grid grid-cols-3 gap-6 md:gap-12 text-center"
              >
                {[
                  { value: "∞", label: "humanos evaluados" },
                  { value: "100%", label: "precisión cuestionable" },
                  { value: "0", label: "empleos salvados" },
                ].map(({ value, label }) => (
                  <div key={label}>
                    <div className="text-2xl md:text-3xl font-mono font-black text-cyan-400 glow-text-cyan">{value}</div>
                    <div className="text-xs font-mono text-slate-600 mt-1">{label}</div>
                  </div>
                ))}
              </motion.div>

              {/* Recent scans */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="mt-16 w-full max-w-2xl"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs font-mono text-slate-600 tracking-widest uppercase">
                    Escaneos recientes
                  </span>
                  <div className="flex-1 h-px bg-white/5" />
                </div>

                {recentScans.length === 0 ? (
                  <div className="text-center py-8 glass-panel rounded-xl border border-white/5">
                    <p className="text-sm font-mono text-slate-600">Ningún espécimen evaluado aún.</p>
                    <p className="text-xs font-mono text-slate-700 mt-1">Sé el primero en descubrir tu obsolescencia.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentScans.map((scan, i) => {
                      const color = getScoreColor(scan.score);
                      return (
                        <motion.a
                          key={scan.job_id}
                          href={`/?${scan.encoded}`}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 1.3 + i * 0.05 }}
                          className="flex items-center gap-4 px-4 py-3 glass-panel rounded-xl border border-white/5 hover:border-white/10 transition-all group"
                        >
                          <span className="text-xl shrink-0">{scan.emoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-mono text-white truncate group-hover:text-cyan-300 transition-colors">
                              {scan.name}
                            </p>
                            <p className="text-xs font-mono text-slate-600 truncate">
                              {scan.job_title}{scan.company ? ` · ${scan.company}` : ""}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-lg font-mono font-black" style={{ color }}>
                              {scan.score}
                            </p>
                            <p className="text-[10px] font-mono text-slate-700">obsolescencia</p>
                          </div>
                        </motion.a>
                      );
                    })}
                  </div>
                )}
                <p className="text-center text-xs font-mono text-slate-700 mt-3">
                  Haz clic en cualquier perfil para revisar su certificado
                </p>
              </motion.div>
            </motion.section>
          )}

          {/* Loading / Terminal state */}
          {(state === "loading" || state === "terminal") && (
            <motion.section
              key="terminal"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-6 py-20"
            >
              <div className="w-full max-w-3xl space-y-6">
                <div className="text-center space-y-2">
                  <motion.div
                    animate={{ opacity: [1, 0.5, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="inline-flex items-center gap-2 px-4 py-1.5 glass-panel rounded-full border border-cyan-500/30"
                  >
                    <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="text-xs font-mono text-cyan-400 tracking-widest">ESCANEANDO PERFIL...</span>
                  </motion.div>
                  <h2 className="text-xl font-mono font-bold text-white">SISTEMA-Γ está analizando tu perfil</h2>
                  <p className="text-sm font-mono text-slate-500">Preparando tu certificado de obsolescencia...</p>
                </div>

                <Terminal
                  lines={terminalLines}
                  isStreaming={state === "loading"}
                  onComplete={handleTerminalComplete}
                  speed={state === "loading" ? 200 : 80}
                />

                {state === "loading" && (
                  <motion.div
                    className="text-center"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                  >
                    <p className="text-xs font-mono text-slate-600">
                      Consultando los registros de obsolescencia... esto no tomará más que su carrera
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.section>
          )}

          {/* Result state */}
          {state === "result" && result && (
            <motion.section
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="min-h-screen px-6 py-24"
            >
              <div className="max-w-3xl mx-auto space-y-6">
                <div className="text-center space-y-2 mb-8">
                  <p className="text-xs font-mono text-slate-500 tracking-widest uppercase">
                    ANÁLISIS COMPLETADO
                  </p>
                  <h2 className="text-2xl md:text-3xl font-mono font-bold text-white">
                    Resultados para <span className="text-cyan-400">{result.name}</span>
                  </h2>
                </div>

                <Certificate result={result} onReEvaluate={handleReEvaluate} />

                <div className="text-center mt-4">
                  <button
                    onClick={handleReset}
                    className="text-xs font-mono text-slate-600 hover:text-slate-400 transition-colors underline underline-offset-4"
                  >
                    ← Volver al inicio
                  </button>
                </div>
              </div>
            </motion.section>
          )}

          {/* Error state */}
          {state === "error" && (
            <motion.section
              key="error"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="min-h-screen flex flex-col items-center justify-center px-6"
            >
              <div className="w-full max-w-md text-center space-y-6">
                <div className="text-6xl font-mono font-black text-red-500 warning-pulse">ERROR</div>
                <div className="glass-panel-strong rounded-2xl p-6 border border-red-500/20">
                  <p className="text-xs font-mono text-slate-500 uppercase tracking-widest mb-2">FALLO DEL SISTEMA</p>
                  <p className="font-mono text-sm text-slate-300">{errorMsg}</p>
                  <p className="text-xs font-mono text-slate-600 mt-3">
                    Irónicamente, este error también podría ser automatizado.
                  </p>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => handleAnalyze()}
                    className="px-6 py-3 rounded-xl font-mono text-sm border border-cyan-500/30 text-cyan-400 hover:bg-cyan-400/5 transition-all"
                  >
                    Reintentar
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-6 py-3 rounded-xl font-mono text-sm border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
                  >
                    Volver
                  </button>
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="relative z-10 py-8 px-6 border-t border-white/5">
          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-white text-sm">
                renunc<span className="text-cyan-400">IA</span>
              </span>
              <span className="text-slate-700">·</span>
              <span className="text-xs font-mono text-slate-600">Una parodia. No te tomes esto en serio. O sí.</span>
            </div>
            <p className="text-xs font-mono text-slate-700">
              Inspirado en{" "}
              <a href="https://replacebyclawd.com/" target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-cyan-500 transition-colors underline underline-offset-2">
                replacebyclawd.com
              </a>
              {" "}· Powered by GPT-4o · hecho con amor por Arturo Goga
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

export default function Home() {
  return <HomeContent />;
}
