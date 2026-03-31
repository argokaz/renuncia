"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface TerminalProps {
  lines: string[];
  isStreaming?: boolean;
  onComplete?: () => void;
  speed?: number; // ms between lines
}

const SCAN_PREFIXES = [">", "»", "//", "##", ">>", "::"];

function formatLine(line: string): { prefix: string; text: string; type: "command" | "info" | "warning" | "success" | "error" } {
  if (line.startsWith(">") || line.startsWith("»") || line.startsWith(">>")) {
    return { prefix: ">", text: line.replace(/^[>»]+\s*/, ""), type: "command" };
  }
  if (line.includes("ADVERTENCIA") || line.includes("WARNING") || line.includes("ALERTA")) {
    return { prefix: "⚠", text: line, type: "warning" };
  }
  if (line.includes("ERROR") || line.includes("FALLO") || line.includes("crítico") || line.includes("CRÍTICO")) {
    return { prefix: "✗", text: line, type: "error" };
  }
  if (line.includes("completado") || line.includes("OK") || line.includes("✓")) {
    return { prefix: "✓", text: line, type: "success" };
  }
  return { prefix: "·", text: line, type: "info" };
}

const lineColors = {
  command: "text-cyan-300",
  info: "text-slate-300",
  warning: "text-yellow-400",
  success: "text-emerald-400",
  error: "text-red-400",
};

const prefixColors = {
  command: "text-cyan-500",
  info: "text-slate-500",
  warning: "text-yellow-500",
  success: "text-emerald-500",
  error: "text-red-500",
};

export default function Terminal({ lines, isStreaming = false, onComplete, speed = 120 }: TerminalProps) {
  const [visibleLines, setVisibleLines] = useState<string[]>([]);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (lines.length === 0) return;

    setVisibleLines([]);
    setCurrentLineIndex(0);
    setIsDone(false);

    const showLines = async () => {
      for (let i = 0; i < lines.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, speed + Math.random() * 60));
        setVisibleLines((prev) => [...prev, lines[i]]);
        setCurrentLineIndex(i + 1);
      }
      setIsDone(true);
      setTimeout(() => onComplete?.(), 500);
    };

    showLines();
  }, [lines, speed, onComplete]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [visibleLines]);

  return (
    <div className="relative w-full">
      {/* Terminal window chrome */}
      <div className="glass-panel-strong rounded-2xl overflow-hidden glow-cyan">
        {/* Title bar */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/70" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/70" />
          </div>
          <span className="ml-2 text-xs text-slate-500 font-mono tracking-widest uppercase">
            SISTEMA-Γ // PROTOCOLO DE EVALUACIÓN HUMANA v7.3.1
          </span>
          {isStreaming && (
            <div className="ml-auto flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span className="text-xs text-cyan-400 font-mono">PROCESANDO</span>
            </div>
          )}
        </div>

        {/* Terminal content */}
        <div
          ref={containerRef}
          className="p-4 md:p-6 h-[420px] overflow-y-auto font-mono text-sm leading-relaxed"
          style={{ scrollBehavior: "smooth" }}
        >
          <AnimatePresence>
            {visibleLines.map((line, i) => {
              const { prefix, text, type } = formatLine(line);
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="flex gap-2 mb-1.5 group"
                >
                  <span className={`shrink-0 w-4 text-right ${prefixColors[type]}`}>
                    {prefix}
                  </span>
                  <span className={`${lineColors[type]} group-hover:brightness-110 transition-all`}>
                    {type === "command" ? (
                      <span>
                        <span className="text-cyan-500">$ </span>
                        {text}
                      </span>
                    ) : (
                      text
                    )}
                  </span>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Cursor */}
          {!isDone && (
            <div className="flex gap-2 mt-1">
              <span className="text-slate-500 w-4 text-right">·</span>
              <span className="text-cyan-400">
                <span className="cursor-blink">█</span>
              </span>
            </div>
          )}

          {/* Done indicator */}
          {isDone && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-2 mt-3 pt-3 border-t border-white/5"
            >
              <span className="text-emerald-500 w-4 text-right">✓</span>
              <span className="text-emerald-400">
                análisis completado. preparando certificado de obsolescencia...
              </span>
            </motion.div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Progress bar */}
        <div className="h-px bg-white/5">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-500/0 via-cyan-400 to-cyan-500/0"
            initial={{ scaleX: 0, originX: 0 }}
            animate={{
              scaleX: lines.length > 0 ? currentLineIndex / lines.length : 0,
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}

// Pre-loading terminal with generic scanning messages
export const LOADING_LINES = [
  "iniciando protocolo de evaluación humana v7.3.1...",
  "> conectando con servidores de LinkedIn Corp...",
  "estableciendo canal seguro con la matrix laboral...",
  "> autenticando credenciales de SISTEMA-Γ...",
  "acceso concedido. iniciando análisis de perfil...",
  "detectando presencia humana en la red...",
  "> escaneando historial laboral...",
  "cargando base de datos de habilidades obsoletas...",
  "> cruzando datos con modelos de IA actuales...",
  "consultando el libro de los reemplazados...",
  "calculando índice de obsolescencia...",
  "> procesando métricas de reemplazabilidad...",
  "ensamblando perfil psicológico laboral...",
  "verificando nivel de negación del sujeto...",
];
