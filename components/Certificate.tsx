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
  peligro_para_la_ia: {
    label: "Peligro para la IA",
    invert: true,
    format: (v) => `${v}/100`,
  },
  cringe_de_linkedin: {
    label: "Cringe de LinkedIn",
    format: (v) => `${v}%`,
  },
  habilidades_unicas: {
    label: "Habilidades únicas",
    invert: true,
    format: (v) => `${v}%`,
  },
  nivel_de_negacion: {
    label: "Nivel de negación",
    format: (v) => `${v}%`,
  },
  anos_hasta_reemplazo: {
    label: "Años hasta reemplazo",
    invert: true,
    format: (v) => `${v} años`,
  },
  sensibilidad_al_feedback: {
    label: "Sensibilidad al feedback",
    format: (v) => `${v}%`,
  },
};

function MetricBar({ value, label, invert, format }: { value: number; label: string; invert?: boolean; format?: (v: number) => string }) {
  const normalized = label === "Años hasta reemplazo" ? Math.min((value / 5) * 100, 100) : value;
  const danger = invert ? 100 - normalized : normalized;
  const color = danger > 70 ? "#ef4444" : danger > 45 ? "#f97316" : "#22d3ee";
  const display = format ? format(value) : `${value}`;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs font-mono text-slate-400">{label}</span>
        <span className="text-xs font-mono" style={{ color }}>{display}</span>
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
    // Use the current URL which already has ?r= encoded result
    const shareUrl = window.location.href;

    try {
      await navigator.clipboard.writeText(shareUrl);
      const btn = document.getElementById("share-btn");
      if (btn) {
        const original = btn.textContent;
        btn.textContent = "¡COPIADO AL PORTAPAPELES!";
        btn.classList.add("border-emerald-500", "text-emerald-400");
        setTimeout(() => {
          if (btn) {
            btn.textContent = original;
            btn.classList.remove("border-emerald-500", "text-emerald-400");
          }
        }, 2000);
      }
    } catch {
      prompt("Copia este link:", shareUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full space-y-4"
    >
      {/* Main certificate */}
      <div
        ref={certRef}
        className="relative glass-panel-strong rounded-2xl overflow-hidden"
        style={{ boxShadow: `0 0 40px ${scoreColor}20, 0 0 80px ${scoreColor}10` }}
      >
        {/* Animated border */}
        <div
          className="absolute inset-0 rounded-2xl opacity-40 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${scoreColor}30, transparent 50%, ${scoreColor}15)`,
          }}
        />

        {/* Header */}
        <div className="relative px-6 pt-6 pb-4 border-b border-white/5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-mono text-slate-500 tracking-[0.3em] uppercase mb-1">
                SISTEMA-Γ // CERTIFICADO OFICIAL
              </p>
              <h2 className="text-lg font-mono font-bold text-white">
                CERTIFICADO DE OBSOLESCENCIA HUMANA
              </h2>
              <p className="text-sm font-mono mt-0.5" style={{ color: scoreColor }}>
                {result.certificate_subtitle}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-slate-600">ID: {result.job_id}</p>
              <p className="text-xs font-mono text-slate-600">
                {new Date(result.generated_at).toLocaleDateString("es-ES")}
              </p>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="relative p-6">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            {/* Score ring */}
            <div className="flex flex-col items-center gap-3 mx-auto md:mx-0">
              <ProgressRing score={result.score} size={200} />
              <div className="text-center">
                <p
                  className="text-xs font-mono tracking-widest uppercase font-bold"
                  style={{ color: scoreColor }}
                >
                  {scoreEmoji} {scoreLabel}
                </p>
              </div>
            </div>

            {/* Info & metrics */}
            <div className="flex-1 space-y-5 min-w-0">
              {/* Subject info */}
              <div className="glass-panel rounded-xl p-4 space-y-2">
                <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-3">
                  SUJETO EVALUADO
                </p>
                <div className="space-y-1">
                  <p className="text-xl font-mono font-bold text-white truncate">{result.name}</p>
                  <p className="text-sm font-mono text-cyan-400">{result.job_title}</p>
                  <p className="text-xs font-mono text-slate-500">
                    {result.company} · {result.location}
                  </p>
                </div>
                <div className="mt-3 pt-3 border-t border-white/5 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">REEMPLAZADO POR:</span>
                    <span className="text-xs font-mono text-orange-400">{result.replacement_by}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-slate-500">FECHA ESTIMADA:</span>
                    <span
                      className="text-xs font-mono font-bold"
                      style={{ color: scoreColor }}
                    >
                      {result.replacement_eta}
                    </span>
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="glass-panel rounded-xl p-4 space-y-3">
                <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-3">
                  MÉTRICAS DE OBSOLESCENCIA
                </p>
                {Object.entries(result.metrics).map(([key, value]) => {
                  const meta = metricLabels[key];
                  if (!meta) return null;
                  return (
                    <MetricBar
                      key={key}
                      value={value as number}
                      label={meta.label}
                      invert={meta.invert}
                      format={meta.format}
                    />
                  );
                })}
              </div>
            </div>
          </div>

          {/* LinkedIn Quotes with commentary */}
          {result.linkedin_quotes?.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
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
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + i * 0.18 }}
                  className="glass-panel rounded-xl overflow-hidden"
                >
                  {/* Quote */}
                  <div className="px-4 pt-4 pb-3 border-b border-white/5">
                    <div className="flex items-start gap-2">
                      <span className="text-blue-400/60 font-mono text-lg leading-none mt-0.5">"</span>
                      <p className="text-sm font-mono text-slate-300 italic leading-relaxed flex-1">
                        {item.quote}
                      </p>
                      <span className="text-blue-400/60 font-mono text-lg leading-none self-end">"</span>
                    </div>
                  </div>
                  {/* Commentary */}
                  <div className="px-4 py-3 flex items-start gap-3 bg-white/[0.015]">
                    <span className="text-xs font-mono text-slate-600 shrink-0 mt-0.5">SISTEMA-Γ:</span>
                    <p className="text-xs font-mono text-slate-400 leading-relaxed">
                      {item.commentary}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {/* Verdict section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mt-4 glass-panel rounded-xl p-4 border-l-2"
            style={{ borderColor: scoreColor }}
          >
            <p className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-2">
              VEREDICTO FINAL
            </p>
            <p className="text-sm font-mono text-slate-200 leading-relaxed">
              {result.verdict}
            </p>
          </motion.div>

          {/* Fun fact */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-3 flex items-start gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/5"
          >
            <span className="text-lg">💡</span>
            <div>
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Dato curioso: </span>
              <span className="text-xs font-mono text-slate-300">{result.fun_fact}</span>
            </div>
          </motion.div>

          {/* Stamp overlay */}
          <motion.div
            initial={{ opacity: 0, scale: 3, rotate: -20 }}
            animate={{ opacity: 1, scale: 1, rotate: -12 }}
            transition={{ delay: 1.2, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="absolute bottom-24 right-6 pointer-events-none"
          >
            <div
              className="border-4 rounded-lg px-3 py-1.5 font-mono font-black text-sm tracking-widest uppercase"
              style={{
                color: scoreColor,
                borderColor: scoreColor,
                boxShadow: `0 0 20px ${scoreColor}40`,
                opacity: 0.85,
              }}
            >
              PROCESADO
            </div>
          </motion.div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-white/5 flex items-center justify-between">
          <p className="text-xs font-mono text-slate-600">
            SISTEMA-Γ · División de Recursos Humanos Automatizados
          </p>
          <p className="text-xs font-mono text-slate-600 hidden md:block">
            renuncIA.vercel.app
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <motion.button
          id="share-btn"
          onClick={handleShare}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="md:col-span-2 glass-panel border border-cyan-500/30 rounded-xl px-6 py-3 font-mono text-sm text-cyan-400 hover:border-cyan-400/60 hover:bg-cyan-400/5 transition-all duration-200 flex items-center justify-center gap-2"
        >
          <span>🔗</span>
          COMPARTIR MI OBSOLESCENCIA
        </motion.button>

        <motion.button
          onClick={onReEvaluate}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          title="Genera un nuevo análisis llamando al API"
          className="glass-panel border border-white/10 rounded-xl px-4 py-3 font-mono text-xs text-slate-500 hover:border-orange-500/30 hover:text-orange-400 transition-all duration-200 flex items-center justify-center gap-1.5"
        >
          <span>↺</span>
          RE-EVALUAR
        </motion.button>
      </div>

      {/* Cache notice */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        className="text-center text-xs font-mono text-slate-700"
      >
        Este resultado está almacenado en el link · RE-EVALUAR genera un nuevo análisis
      </motion.p>

      {/* Share preview + credits */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center space-y-2"
      >
        <p className="text-xs font-mono text-slate-600">
          Comparte tu certificado · Haz que tus colegas sufran también ·{" "}
          <span style={{ color: getScoreColor(result.score) }}>
            {result.score >= 75 ? "Con amor, la IA que te reemplazó" : "Sobreviviste (por ahora)"}
          </span>
        </p>
        <p className="text-xs font-mono text-slate-700">
          Inspirado en{" "}
          <a
            href="https://replacebyclawd.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-cyan-500 transition-colors underline underline-offset-2"
          >
            replacebyclawd.com
          </a>
          {" "}· construido con renuncIA
        </p>
      </motion.div>
    </motion.div>
  );
}
