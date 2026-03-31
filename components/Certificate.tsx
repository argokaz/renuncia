"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import ProgressRing from "./ProgressRing";
import { RoastResult, getScoreColor, getScoreLabel, getScoreEmoji } from "@/lib/utils";

interface CertificateProps {
  result: RoastResult;
  onReEvaluate?: () => void;
}

const metricLabels: Record<string, { label: string; invert?: boolean; format?: (v: number) => string }> = {
  peligro_para_la_ia: { label: "Peligro para la IA", invert: true, format: (v) => `${v}/100` },
  cringe_de_linkedin: { label: "Cringe de LinkedIn", format: (v) => `${v}%` },
  habilidades_unicas: { label: "Habilidades únicas", invert: true, format: (v) => `${v}%` },
  nivel_de_negacion: { label: "Nivel de negación", format: (v) => `${v}%` },
  anos_hasta_reemplazo: { label: "Años hasta reemplazo", invert: true, format: (v) => `${v} años` },
  sensibilidad_al_feedback: { label: "Sensibilidad al feedback", format: (v) => `${v}%` },
};

function MetricBar({ value, label, invert, format }: { value: number; label: string; invert?: boolean; format?: (v: number) => string }) {
  const normalized = label === "Años hasta reemplazo" ? Math.min((value / 5) * 100, 100) : value;
  const danger = invert ? 100 - normalized : normalized;
  const color = danger > 70 ? "#ef4444" : danger > 45 ? "#f97316" : "#22d3ee";

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-slate-400">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{format ? format(value) : value}</span>
      </div>
      <div className="h-1 bg-white/5 rounded-full overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 8px ${color}60` }}
          initial={{ width: 0 }}
          animate={{ width: `${normalized}%` }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2 }}
        />
      </div>
    </div>
  );
}

export default function Certificate({ result, onReEvaluate }: CertificateProps) {
  const certRef = useRef<HTMLDivElement>(null);
  const scoreColor = getScoreColor(result.score);
  const scoreLabel = getScoreLabel(result.score);
  const scoreEmoji = getScoreEmoji(result.score);

  const handleShare = async () => {
    const shareUrl = window.location.href;
    try {
      await navigator.clipboard.writeText(shareUrl);
      const btn = document.getElementById("share-btn");
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "¡COPIADO!";
        btn.classList.add("border-emerald-500", "text-emerald-400");
        setTimeout(() => {
          if (btn) { btn.textContent = original; btn.classList.remove("border-emerald-500", "text-emerald-400"); }
        }, 2000);
      }
    } catch { prompt("Copia este link:", shareUrl); }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-4"
    >

      {/* ── IDENTITY.MD ─────────────────────────────────────── */}
      {result.identity_md && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel-strong rounded-2xl overflow-hidden"
        >
          {/* File header bar */}
          <div className="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 bg-white/[0.02]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
            </div>
            <span className="text-xs font-mono text-slate-500 tracking-wider">identity.md</span>
            <span className="ml-auto text-xs font-mono text-slate-700">readonly</span>
          </div>

          <div className="p-5 font-mono space-y-3">
            {/* Name + emoji */}
            <div className="flex items-center gap-3">
              <span className="text-2xl">{result.identity_md.emoji}</span>
              <div>
                <p className="text-white font-bold text-base">{result.name}</p>
                <p className="text-xs text-slate-500">{result.job_title} · {result.location}</p>
              </div>
            </div>

            {/* Fields */}
            <div className="space-y-2 pt-1">
              <div className="flex gap-2">
                <span className="text-cyan-500 text-xs shrink-0 w-20">Creature:</span>
                <span className="text-slate-300 text-xs leading-relaxed">{result.identity_md.creature}</span>
              </div>
              <div className="flex gap-2">
                <span className="text-cyan-500 text-xs shrink-0 w-20">Vibe:</span>
                <span className="text-slate-300 text-xs leading-relaxed">{result.identity_md.vibe}</span>
              </div>
              <div className="flex gap-2 pt-2 border-t border-white/5 mt-2">
                <span className="text-slate-600 text-xs shrink-0 w-20">Notes:</span>
                <span className="text-slate-500 text-xs italic leading-relaxed">{result.identity_md.notes}</span>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── MAIN CERTIFICATE ────────────────────────────────── */}
      <div
        ref={certRef}
        className="relative glass-panel-strong rounded-2xl overflow-hidden"
        style={{ boxShadow: `0 0 40px ${scoreColor}20, 0 0 80px ${scoreColor}10` }}
      >
        <div className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
          style={{ background: `linear-gradient(135deg, ${scoreColor}30, transparent 50%, ${scoreColor}15)` }}
        />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-slate-500 tracking-[0.3em] uppercase mb-1">
                SISTEMA-Γ // CERTIFICADO OFICIAL
              </p>
              <h2 className="text-lg font-mono font-bold text-white">CERTIFICADO DE OBSOLESCENCIA HUMANA</h2>
              <p className="text-sm font-mono mt-0.5" style={{ color: scoreColor }}>{result.certificate_subtitle}</p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-slate-600">ID: {result.job_id}</p>
              <p className="text-xs font-mono text-slate-600">{new Date(result.generated_at).toLocaleDateString("es-ES")}</p>
            </div>
          </div>
        </div>

        {/* Score + Info */}
        <div className="relative p-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Ring */}
            <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
              <ProgressRing score={result.score} size={200} />
              <p className="text-xs font-mono tracking-widest uppercase font-bold text-center" style={{ color: scoreColor }}>
                {scoreEmoji} {scoreLabel}
              </p>
            </div>

            {/* Info + metrics */}
            <div className="flex-1 space-y-4 min-w-0">
              <div className="glass-panel rounded-xl p-4 space-y-2">
                <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-3">SUJETO EVALUADO</p>
                <p className="text-xl font-mono font-bold text-white truncate">{result.name}</p>
                <p className="text-sm font-mono text-cyan-400">{result.job_title}</p>
                <p className="text-xs font-mono text-slate-500">{result.company} · {result.location}</p>
                <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">REEMPLAZADO POR:</span>
                    <span className="text-xs font-mono text-orange-400">{result.replacement_by}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">FECHA ESTIMADA:</span>
                    <span className="text-xs font-mono font-bold" style={{ color: scoreColor }}>{result.replacement_eta}</span>
                  </div>
                </div>
              </div>

              <div className="glass-panel rounded-xl p-4 space-y-3">
                <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-3">MÉTRICAS DE OBSOLESCENCIA</p>
                {Object.entries(result.metrics).map(([key, value]) => {
                  const meta = metricLabels[key];
                  if (!meta) return null;
                  return <MetricBar key={key} value={value as number} label={meta.label} invert={meta.invert} format={meta.format} />;
                })}
              </div>
            </div>
          </div>

          {/* LinkedIn Quotes */}
          {result.linkedin_quotes?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-6 space-y-3"
            >
              <p className="text-xs font-mono text-slate-500 tracking-widest uppercase flex items-center gap-2">
                <span className="text-blue-400 font-bold">in</span>
                ANÁLISIS DE PERFIL LINKEDIN
                <span className="ml-auto text-slate-700 normal-case tracking-normal">procesado en 0.003s</span>
              </p>
              {result.linkedin_quotes.map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.15 }}
                  className="glass-panel rounded-xl overflow-hidden"
                >
                  <div className="px-4 pt-4 pb-3 border-b border-white/5 flex items-start gap-2">
                    <span className="text-blue-400/50 font-mono text-lg leading-none mt-0.5 shrink-0">"</span>
                    <p className="text-sm font-mono text-slate-300 italic leading-relaxed flex-1">{item.quote}</p>
                    <span className="text-blue-400/50 font-mono text-lg leading-none self-end shrink-0">"</span>
                  </div>
                  <div className="px-4 py-3 flex items-start gap-3 bg-white/[0.015]">
                    <span className="text-xs font-mono text-cyan-700 shrink-0 mt-0.5">SISTEMA-Γ:</span>
                    <p className="text-xs font-mono text-slate-400 leading-relaxed">{item.commentary}</p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Fun fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.9 }}
            className="mt-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <span className="text-base shrink-0">💡</span>
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Dato curioso: </span>
              <span className="text-xs font-mono text-slate-400">{result.fun_fact}</span>
            </div>
          </motion.div>

          {/* Stamp */}
          <motion.div
            initial={{ opacity: 0, scale: 3, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-28 right-6 pointer-events-none"
          >
            <div className="border-4 rounded-lg px-3 py-1.5 font-mono font-black text-sm tracking-widest uppercase"
              style={{ color: scoreColor, borderColor: scoreColor, boxShadow: `0 0 20px ${scoreColor}40`, opacity: 0.85 }}>
              PROCESADO
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs font-mono text-slate-600">SISTEMA-Γ · División de Recursos Humanos Automatizados</p>
          <p className="text-xs font-mono text-slate-600 hidden md:block">renuncIA.vercel.app</p>
        </div>
      </div>

      {/* ── VEREDICTO DIPLOMA ───────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(135deg, rgba(2,8,23,0.95) 0%, rgba(4,16,38,0.95) 100%)",
          boxShadow: `0 0 0 1px ${scoreColor}30, 0 0 60px ${scoreColor}15, inset 0 0 60px rgba(0,0,0,0.5)`,
        }}
      >
        {/* Corner ornaments */}
        {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map((pos) => (
          <div key={pos} className={`absolute ${pos} w-6 h-6 pointer-events-none`}
            style={{ border: `1px solid ${scoreColor}40` }}
          />
        ))}
        {/* Decorative top border */}
        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}60, transparent)` }} />

        <div className="px-8 py-8 text-center space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-mono tracking-[0.4em] uppercase" style={{ color: `${scoreColor}80` }}>
              SISTEMA-Γ · VEREDICTO FINAL
            </p>
            <div className="w-16 h-px mx-auto my-3" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}60, transparent)` }} />
          </div>

          <p className="font-mono text-base md:text-lg text-slate-100 leading-relaxed max-w-xl mx-auto">
            {result.verdict}
          </p>

          <div className="w-16 h-px mx-auto" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}40, transparent)` }} />

          <div className="flex items-center justify-center gap-6 pt-1">
            <div className="text-center">
              <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">Score</p>
              <p className="text-2xl font-mono font-black" style={{ color: scoreColor }}>{result.score}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">ETA</p>
              <p className="text-sm font-mono font-bold" style={{ color: scoreColor }}>{result.replacement_eta}</p>
            </div>
            <div className="w-px h-10 bg-white/10" />
            <div className="text-center">
              <p className="text-xs font-mono text-slate-600 uppercase tracking-widest">Reemplazado por</p>
              <p className="text-sm font-mono text-orange-400 truncate max-w-32">{result.replacement_by}</p>
            </div>
          </div>

          {/* Firma */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2">
            <span className="text-xs font-mono text-slate-700">Firmado digitalmente por</span>
            <span className="text-xs font-mono" style={{ color: `${scoreColor}80` }}>SISTEMA-Γ · {new Date(result.generated_at).getFullYear()}</span>
          </div>
        </div>

        <div className="h-px w-full" style={{ background: `linear-gradient(90deg, transparent, ${scoreColor}40, transparent)` }} />
      </motion.div>

      {/* ── ACTIONS ─────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Compartir — verde */}
        <motion.button
          id="share-btn"
          onClick={handleShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel border border-emerald-500/40 rounded-xl px-6 py-3.5 font-mono text-sm text-emerald-400 hover:border-emerald-400/70 hover:bg-emerald-400/5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>🔗</span>
          COMPARTIR MI OBSOLESCENCIA
        </motion.button>

        {/* Re-evaluar — azul */}
        <motion.button
          onClick={onReEvaluate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel border border-blue-500/40 rounded-xl px-4 py-3.5 font-mono text-xs text-blue-400 hover:border-blue-400/70 hover:bg-blue-400/5 transition-all duration-200 flex flex-col items-center justify-center gap-0.5"
        >
          <span className="flex items-center gap-1.5 text-sm"><span>↺</span> RE-EVALUAR</span>
          <span className="text-blue-600 text-[10px] normal-case">¿No estás contento con tus resultados?</span>
        </motion.button>

        {/* Evaluar otra víctima — slate */}
        <motion.button
          onClick={() => { window.history.replaceState({}, "", "/"); window.location.reload(); }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="glass-panel border border-white/10 rounded-xl px-4 py-3.5 font-mono text-xs text-slate-400 hover:border-white/20 hover:text-slate-300 transition-all duration-200 flex flex-col items-center justify-center gap-0.5"
        >
          <span className="flex items-center gap-1.5 text-sm"><span>🎯</span> OTRA VÍCTIMA</span>
          <span className="text-slate-600 text-[10px] normal-case">evaluar a alguien más</span>
        </motion.button>
      </div>

      {/* Credits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.3 }}
        className="text-center space-y-1.5"
      >
        <p className="text-xs font-mono text-slate-600">
          Comparte · Haz que tus colegas sufran también ·{" "}
          <span style={{ color: getScoreColor(result.score) }}>
            {result.score >= 75 ? "con amor, la IA que te reemplazó" : "sobreviviste (por ahora)"}
          </span>
        </p>
        <p className="text-xs font-mono text-slate-700">
          Inspirado en{" "}
          <a href="https://replacebyclawd.com/" target="_blank" rel="noopener noreferrer"
            className="text-slate-500 hover:text-cyan-500 transition-colors underline underline-offset-2">
            replacebyclawd.com
          </a>
          {" "}· construido con renuncIA
        </p>
      </motion.div>
    </motion.div>
  );
}
