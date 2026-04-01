"use client";

import { useState, useRef, useCallback } from "react";
import { motion } from "framer-motion";
import { RoastResult, getScoreColor } from "@/lib/utils";
import html2canvas from "html2canvas";

interface Format {
  id: string;
  label: string;
  subtitle: string;
  width: number;
  height: number;
}

const FORMATS: Format[] = [
  { id: "stories",  label: "Stories",  subtitle: "Instagram Stories · 9:16",  width: 1080, height: 1920 },
  { id: "post",     label: "Post",     subtitle: "Instagram / Facebook · 1:1", width: 1080, height: 1080 },
  { id: "linkedin", label: "LinkedIn", subtitle: "LinkedIn Post · 1.91:1",     width: 1200, height: 628  },
  { id: "twitter",  label: "Twitter/X",subtitle: "Twitter / X · 16:9",         width: 1200, height: 675  },
];

interface SharePlatform {
  id: string;
  label: string;
  icon: string;
  color: string;
  getUrl: (score: number, name: string) => string | null;
}

const PLATFORMS: SharePlatform[] = [
  {
    id: "twitter", label: "Twitter / X", icon: "𝕏", color: "#1d9bf0",
    getUrl: (score, name) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Mi índice de obsolescencia es ${score}/100 🤖\n"${name}" será reemplazado por IA.\n\n¿Cuál es el tuyo?`
      )}&url=${encodeURIComponent("https://renuncia.vercel.app")}`,
  },
  {
    id: "linkedin", label: "LinkedIn", icon: "in", color: "#0a66c2",
    getUrl: () =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://renuncia.vercel.app")}`,
  },
  {
    id: "facebook", label: "Facebook", icon: "f", color: "#1877f2",
    getUrl: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://renuncia.vercel.app")}`,
  },
  {
    id: "instagram", label: "Instagram", icon: "◎", color: "#e1306c",
    getUrl: () => null,
  },
];

// ─── Certificate image ───────────────────────────────────────────────────────
function ScoreCircle({
  score,
  scoreColor,
  size,
}: {
  score: number;
  scoreColor: string;
  size: number;
}) {
  const r = size;
  const ringGap = r * 0.07;
  const outerR = r * 0.5 - ringGap;
  const innerR = outerR * 0.72;

  // 24 tick marks around the outer circle
  const ticks = Array.from({ length: 24 }, (_, i) => {
    const angle = (i * 360) / 24;
    const isMajor = i % 6 === 0;
    const tickLen = isMajor ? r * 0.06 : r * 0.035;
    const tickW = isMajor ? r * 0.012 : r * 0.007;
    const rad = (angle * Math.PI) / 180;
    const cx = r * 0.5;
    const cy = r * 0.5;
    const dist = outerR - tickLen * 0.5;
    const x1 = cx + Math.cos(rad) * (dist - tickLen / 2);
    const y1 = cy + Math.sin(rad) * (dist - tickLen / 2);
    const x2 = cx + Math.cos(rad) * (dist + tickLen / 2);
    const y2 = cy + Math.sin(rad) * (dist + tickLen / 2);
    return { x1, y1, x2, y2, isMajor, tickW };
  });

  // Everything rendered inside one SVG — no stacking context issues in html2canvas
  const cx = r / 2;
  const cy = r / 2;
  const scoreFontSize = r * 0.38;
  const labelFontSize = r * 0.072;

  return (
    <svg
      width={r}
      height={r}
      style={{ display: "block", flexShrink: 0, overflow: "visible" }}
    >
      {/* Outer dashed ring */}
      <circle cx={cx} cy={cy} r={outerR}
        fill="none" stroke="rgba(34,211,238,0.35)"
        strokeWidth={r * 0.008}
        strokeDasharray={`${r * 0.025} ${r * 0.018}`}
      />
      {/* Mid ring */}
      <circle cx={cx} cy={cy} r={outerR * 0.88}
        fill="none" stroke="rgba(34,211,238,0.12)"
        strokeWidth={r * 0.004}
      />
      {/* Inner glow fill */}
      <circle cx={cx} cy={cy} r={innerR * 0.96}
        fill={`${scoreColor}12`}
      />
      {/* Inner colored ring */}
      <circle cx={cx} cy={cy} r={innerR}
        fill="none" stroke={scoreColor}
        strokeWidth={r * 0.018} strokeOpacity={0.9}
      />
      {/* Ticks */}
      {ticks.map((t, i) => (
        <line key={i}
          x1={t.x1} y1={t.y1} x2={t.x2} y2={t.y2}
          stroke={t.isMajor ? "#22d3ee" : "rgba(34,211,238,0.3)"}
          strokeWidth={t.tickW} strokeLinecap="round"
        />
      ))}
      {/* Cross hairs */}
      <line x1={cx - r * 0.1} y1={cy} x2={cx + r * 0.1} y2={cy}
        stroke={`${scoreColor}35`} strokeWidth={r * 0.004} />
      <line x1={cx} y1={cy - r * 0.1} x2={cx} y2={cy + r * 0.1}
        stroke={`${scoreColor}35`} strokeWidth={r * 0.004} />
      {/* Score number — rendered in SVG, no z-index issues */}
      <text
        x={cx} y={cy - scoreFontSize * 0.08}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={scoreFontSize}
        fontWeight="900"
        fill={scoreColor}
        fontFamily="'Courier New', Courier, monospace"
        letterSpacing="-0.05em"
      >
        {score}
      </text>
      {/* SCORE label */}
      <text
        x={cx} y={cy + scoreFontSize * 0.6}
        textAnchor="middle" dominantBaseline="middle"
        fontSize={labelFontSize}
        fill={scoreColor} opacity={0.75}
        fontFamily="'Courier New', Courier, monospace"
        letterSpacing="0.14em"
      >
        SCORE
      </text>
    </svg>
  );
}

function CertificateImage({ result, width, height }: { result: RoastResult; width: number; height: number }) {
  const scoreColor = getScoreColor(result.score);
  const isLandscape = width > height;
  const isSquare = !isLandscape && Math.abs(width - height) < 50;

  // px helpers
  const s  = (n: number) => Math.round((n / 1080) * width);

  // For portrait (stories), use height-based scaling to make text big
  const fs = (n: number) => isLandscape ? s(n) : Math.round((n / 1080) * height * (isSquare ? 1 : 1.6));

  const pad = s(isLandscape ? 52 : 58);

  return (
    <div style={{
      width, height, background: "#020817",
      position: "relative", overflow: "hidden",
      fontFamily: "'Courier New', Courier, monospace",
      display: "flex", flexDirection: "column",
      boxSizing: "border-box",
    }}>
      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `
          linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px),
          linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)`,
        backgroundSize: `${s(55)}px ${s(55)}px`,
      }} />

      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 110% 90% at 50% 50%, transparent 35%, rgba(0,0,0,0.65) 100%)",
      }} />

      {/* Horizontal scan line */}
      <div style={{
        position: "absolute", top: isLandscape ? "45%" : "38%", left: 0, right: 0,
        height: s(1), background: `linear-gradient(90deg, transparent, ${scoreColor}20, transparent)`,
      }} />

      {/* Top accent */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: s(5), background: scoreColor }} />
      <div style={{
        position: "absolute", top: s(5), left: 0, right: 0, height: s(1),
        background: `linear-gradient(90deg, transparent, rgba(34,211,238,0.4), transparent)`,
      }} />

      {/* Corner brackets */}
      {[
        { top: s(18), left: s(18), borderTop: true, borderLeft: true },
        { top: s(18), right: s(18), borderTop: true, borderRight: true },
        { bottom: s(18), left: s(18), borderBottom: true, borderLeft: true },
        { bottom: s(18), right: s(18), borderBottom: true, borderRight: true },
      ].map((c, i) => {
        const bw = s(3);
        const bs = `${bw}px solid ${scoreColor}55`;
        return (
          <div key={i} style={{
            position: "absolute", width: s(38), height: s(38), ...c,
            borderTop: c.borderTop ? bs : undefined,
            borderBottom: c.borderBottom ? bs : undefined,
            borderLeft: c.borderLeft ? bs : undefined,
            borderRight: c.borderRight ? bs : undefined,
          }} />
        );
      })}

      {isLandscape ? (
        /* ── LANDSCAPE ────────────────────────────── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: pad, gap: s(20), position: "relative" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: s(12) }}>
              <div style={{
                width: s(40), height: s(40), borderRadius: s(7),
                border: `${s(2)}px solid rgba(34,211,238,0.45)`,
                background: "rgba(34,211,238,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: s(20), color: "#22d3ee", fontWeight: "bold",
              }}>Γ</div>
              <span style={{ fontSize: s(24), fontWeight: "bold", color: "white", letterSpacing: "-0.02em" }}>
                renunc<span style={{ color: "#22d3ee" }}>IA</span>
              </span>
            </div>
            <div style={{
              padding: `${s(6)}px ${s(14)}px`,
              border: `${s(1)}px solid rgba(34,211,238,0.3)`,
              borderRadius: s(100),
              background: "rgba(34,211,238,0.06)",
            }}>
              <span style={{ fontSize: s(11), color: "#22d3ee", letterSpacing: "0.15em", textTransform: "uppercase" }}>
                CERTIFICADO DE OBSOLESCENCIA
              </span>
            </div>
          </div>

          {/* Main row */}
          <div style={{ flex: 1, display: "flex", gap: s(44), alignItems: "center" }}>
            {/* Score circle */}
            <ScoreCircle score={result.score} scoreColor={scoreColor} size={s(290)} />

            {/* Vertical divider */}
            <div style={{
              width: s(1), alignSelf: "stretch",
              background: `linear-gradient(180deg, transparent, ${scoreColor}45, transparent)`,
            }} />

            {/* Info */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: s(16) }}>
              <div>
                <div style={{ fontSize: s(11), color: "rgba(100,116,139,0.9)", letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: s(6) }}>
                  SUJETO EVALUADO
                </div>
                <div style={{ fontSize: s(30), fontWeight: "bold", color: "white", lineHeight: 1.2, marginBottom: s(6) }}>
                  {result.name}
                </div>
                <div style={{ fontSize: s(16), color: "#22d3ee" }}>
                  {result.job_title} · {result.company}
                </div>
              </div>

              {/* Verdict — large */}
              <div style={{
                background: "rgba(34,211,238,0.04)",
                border: `${s(1)}px solid rgba(34,211,238,0.15)`,
                borderLeft: `${s(3)}px solid ${scoreColor}`,
                borderRadius: s(8), padding: `${s(14)}px ${s(18)}px`,
              }}>
                <div style={{ fontSize: s(17), color: "rgba(226,232,240,0.92)", lineHeight: 1.6, fontStyle: "italic" }}>
                  "{result.verdict.length > 160 ? result.verdict.substring(0, 160) + "…" : result.verdict}"
                </div>
              </div>

              {/* Meta row */}
              <div style={{ display: "flex", gap: s(20), alignItems: "center" }}>
                <div style={{
                  padding: `${s(8)}px ${s(14)}px`,
                  background: "rgba(251,146,60,0.08)",
                  border: `${s(1)}px solid rgba(251,146,60,0.25)`,
                  borderRadius: s(6),
                }}>
                  <div style={{ fontSize: s(10), color: "rgba(251,146,60,0.7)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Reemplazado por</div>
                  <div style={{ fontSize: s(15), color: "#fb923c", fontWeight: "bold", marginTop: s(2) }}>{result.replacement_by}</div>
                </div>
                <div style={{
                  padding: `${s(8)}px ${s(14)}px`,
                  background: `${scoreColor}08`,
                  border: `${s(1)}px solid ${scoreColor}25`,
                  borderRadius: s(6),
                }}>
                  <div style={{ fontSize: s(10), color: `${scoreColor}80`, letterSpacing: "0.1em", textTransform: "uppercase" }}>ETA</div>
                  <div style={{ fontSize: s(15), color: scoreColor, fontWeight: "bold", marginTop: s(2) }}>{result.replacement_eta}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            paddingTop: s(14), borderTop: `${s(1)}px solid rgba(255,255,255,0.06)`,
          }}>
            <span style={{ fontSize: s(12), color: "rgba(71,85,105,0.85)", letterSpacing: "0.05em" }}>
              SISTEMA-Γ · División RRHH Automatizados
            </span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: s(16), color: scoreColor, fontWeight: "bold", letterSpacing: "0.04em" }}>
                renuncia.vercel.app
              </div>
              <div style={{ fontSize: s(10), color: "rgba(71,85,105,0.6)", marginTop: s(2) }}>
                hecho con amor por Arturo Goga
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ── PORTRAIT / SQUARE ────────────────────────────── */
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: pad, gap: fs(isSquare ? 22 : 26), position: "relative" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: fs(14) }}>
              <div style={{
                width: fs(46), height: fs(46), borderRadius: fs(8),
                border: `${fs(2)}px solid rgba(34,211,238,0.45)`,
                background: "rgba(34,211,238,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: fs(22), color: "#22d3ee", fontWeight: "bold",
              }}>Γ</div>
              <span style={{ fontSize: fs(28), fontWeight: "bold", color: "white", letterSpacing: "-0.02em" }}>
                renunc<span style={{ color: "#22d3ee" }}>IA</span>
              </span>
            </div>
            <div style={{
              padding: `${fs(7)}px ${fs(16)}px`,
              border: `${fs(1)}px solid rgba(34,211,238,0.3)`,
              borderRadius: fs(100), background: "rgba(34,211,238,0.06)",
            }}>
              <span style={{ fontSize: fs(11), color: "#22d3ee", letterSpacing: "0.14em", textTransform: "uppercase" }}>
                CERT. OFICIAL
              </span>
            </div>
          </div>

          {/* Score circle — centered hero */}
          <div style={{ display: "flex", justifyContent: "center" }}>
            <ScoreCircle score={result.score} scoreColor={scoreColor} size={isSquare ? s(360) : fs(460)} />
          </div>

          {/* Person */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: fs(isSquare ? 34 : 42), fontWeight: "bold", color: "white", lineHeight: 1.2, marginBottom: fs(8) }}>
              {result.name}
            </div>
            <div style={{ fontSize: fs(isSquare ? 20 : 26), color: "#22d3ee", marginBottom: fs(6) }}>
              {result.job_title}
            </div>
            <div style={{ fontSize: fs(isSquare ? 15 : 20), color: "rgba(148,163,184,0.6)" }}>
              {result.company}
            </div>
          </div>

          {/* Verdict — large and prominent */}
          <div style={{
            background: "rgba(34,211,238,0.04)",
            border: `${fs(1)}px solid rgba(34,211,238,0.15)`,
            borderLeft: `${fs(4)}px solid ${scoreColor}`,
            borderRadius: fs(10),
            padding: `${fs(isSquare ? 20 : 28)}px ${fs(isSquare ? 24 : 32)}px`,
            flex: isSquare ? 0 : 1,
            display: "flex", alignItems: "center",
          }}>
            <div style={{
              fontSize: fs(isSquare ? 19 : 26),
              color: "rgba(226,232,240,0.95)",
              lineHeight: 1.65,
              fontStyle: "italic",
            }}>
              "{result.verdict}"
            </div>
          </div>

          {/* Meta boxes */}
          <div style={{ display: "flex", gap: fs(14) }}>
            <div style={{
              flex: 1, padding: `${fs(12)}px ${fs(16)}px`,
              background: "rgba(251,146,60,0.07)",
              border: `${fs(1)}px solid rgba(251,146,60,0.22)`,
              borderRadius: fs(8), textAlign: "center",
            }}>
              <div style={{ fontSize: fs(isSquare ? 11 : 14), color: "rgba(251,146,60,0.7)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: fs(4) }}>
                Reemplazado por
              </div>
              <div style={{ fontSize: fs(isSquare ? 16 : 22), color: "#fb923c", fontWeight: "bold" }}>
                {result.replacement_by}
              </div>
            </div>
            <div style={{
              flex: 1, padding: `${fs(12)}px ${fs(16)}px`,
              background: `${scoreColor}07`,
              border: `${fs(1)}px solid ${scoreColor}22`,
              borderRadius: fs(8), textAlign: "center",
            }}>
              <div style={{ fontSize: fs(isSquare ? 11 : 14), color: `${scoreColor}80`, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: fs(4) }}>
                Fecha estimada
              </div>
              <div style={{ fontSize: fs(isSquare ? 16 : 22), color: scoreColor, fontWeight: "bold" }}>
                {result.replacement_eta}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "flex-end",
            paddingTop: fs(isSquare ? 14 : 18),
            borderTop: `${fs(1)}px solid rgba(255,255,255,0.06)`,
          }}>
            <span style={{ fontSize: fs(isSquare ? 12 : 16), color: "rgba(71,85,105,0.85)" }}>
              SISTEMA-Γ · {new Date(result.generated_at).getFullYear()}
            </span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: fs(isSquare ? 18 : 26), color: scoreColor, fontWeight: "bold", letterSpacing: "0.03em" }}>
                renuncia.vercel.app
              </div>
              <div style={{ fontSize: fs(isSquare ? 11 : 15), color: "rgba(71,85,105,0.6)", marginTop: fs(3) }}>
                hecho con amor por Arturo Goga
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom accent */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: s(4),
        background: `linear-gradient(90deg, transparent, ${scoreColor}60, transparent)`,
      }} />
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────
interface ShareImageModalProps {
  result: RoastResult;
  onClose: () => void;
}

export default function ShareImageModal({ result, onClose }: ShareImageModalProps) {
  const [selectedFormat, setSelectedFormat] = useState("stories");
  const [status, setStatus] = useState<"idle" | "generating" | "copied">("idle");
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const fmt = FORMATS.find((f) => f.id === selectedFormat)!;

  const maxPreviewW = 280;
  const maxPreviewH = 420;
  const previewScale = Math.min(maxPreviewW / fmt.width, maxPreviewH / fmt.height);
  const previewW = Math.round(fmt.width * previewScale);
  const previewH = Math.round(fmt.height * previewScale);

  const generateBlob = useCallback(async (): Promise<Blob | null> => {
    if (!captureRef.current) return null;
    const canvas = await html2canvas(captureRef.current, {
      scale: 1, useCORS: true, backgroundColor: "#020817", logging: false,
    });
    return new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  }, []);

  const handleDownload = async () => {
    setStatus("generating");
    try {
      const blob = await generateBlob();
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `renuncia-${result.name.replace(/\s+/g, "-").toLowerCase()}-${selectedFormat}.png`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) { console.error(e); }
    finally { setStatus("idle"); }
  };

  const handleSharePlatform = async (platform: SharePlatform) => {
    setStatus("generating");
    setActivePlatform(platform.id);
    try {
      const blob = await generateBlob();
      if (blob) {
        try {
          await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
          setStatus("copied");
        } catch { setStatus("idle"); }
      }
      const url = platform.getUrl(result.score, result.name);
      if (url) setTimeout(() => window.open(url, "_blank", "noopener"), 300);
      setTimeout(() => { setStatus("idle"); setActivePlatform(null); }, 3500);
    } catch (e) {
      console.error(e);
      setStatus("idle");
      setActivePlatform(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,8,23,0.93)", backdropFilter: "blur(14px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel-strong rounded-2xl overflow-hidden w-full flex"
        style={{ border: "1px solid rgba(255,255,255,0.08)", maxHeight: "94vh", maxWidth: 820 }}
      >
        {/* LEFT — preview */}
        <div className="flex flex-col items-center justify-center bg-black/20 p-5 gap-2 shrink-0">
          <p className="text-[10px] font-mono text-slate-600 tracking-wider">{fmt.subtitle}</p>
          <div style={{
            width: previewW, height: previewH, overflow: "hidden",
            borderRadius: 6, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0,
          }}>
            <div style={{
              width: fmt.width, height: fmt.height,
              transform: `scale(${previewScale})`, transformOrigin: "top left",
            }}>
              <CertificateImage result={result} width={fmt.width} height={fmt.height} />
            </div>
          </div>
          <p className="text-[10px] font-mono text-slate-700">{fmt.width}×{fmt.height}px</p>
        </div>

        {/* RIGHT — controls */}
        <div className="flex flex-col flex-1 min-w-0 overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5 shrink-0">
            <div>
              <h3 className="font-mono font-bold text-white text-sm">COMPARTIR IMAGEN</h3>
              <p className="text-xs font-mono text-slate-500 mt-0.5">Elige formato y plataforma</p>
            </div>
            <button onClick={onClose}
              className="text-slate-500 hover:text-white transition-colors w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 font-mono">
              ✕
            </button>
          </div>

          {/* Format tabs */}
          <div className="px-5 py-3 border-b border-white/5 shrink-0">
            <p className="text-[10px] font-mono text-slate-600 tracking-widest uppercase mb-2">Formato</p>
            <div className="grid grid-cols-2 gap-1.5">
              {FORMATS.map((f) => (
                <button key={f.id} onClick={() => setSelectedFormat(f.id)}
                  className={`px-3 py-2 rounded-lg font-mono text-xs text-left transition-all ${
                    selectedFormat === f.id
                      ? "bg-violet-500/20 border border-violet-500/50 text-violet-300"
                      : "border border-white/8 text-slate-500 hover:border-white/15 hover:text-slate-400"
                  }`}
                >
                  <div className="font-bold">{f.label}</div>
                  <div className="opacity-50 text-[10px]">{f.subtitle.split("·")[1]?.trim()}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Platforms */}
          <div className="px-5 py-3 border-b border-white/5 shrink-0">
            <p className="text-[10px] font-mono text-slate-600 tracking-widest uppercase mb-1">
              Compartir en
            </p>
            <p className="text-[10px] font-mono text-slate-700 mb-2">
              Copia imagen al portapapeles + abre el compositor
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {PLATFORMS.map((platform) => {
                const isActive = activePlatform === platform.id;
                const isCopied = isActive && status === "copied";
                const isLoading = isActive && status === "generating";
                return (
                  <motion.button
                    key={platform.id}
                    onClick={() => handleSharePlatform(platform)}
                    disabled={status === "generating"}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-3 py-2.5 rounded-lg font-mono text-xs border transition-all disabled:opacity-50"
                    style={{
                      borderColor: isCopied ? "#22d3ee50" : `${platform.color}35`,
                      color: isCopied ? "#22d3ee" : platform.color,
                      background: isCopied ? "rgba(34,211,238,0.08)" : `${platform.color}10`,
                    }}
                  >
                    <span style={{
                      width: 20, height: 20, borderRadius: 4,
                      background: `${platform.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 10, fontWeight: "bold", flexShrink: 0,
                    }}>
                      {isLoading ? "⟳" : platform.icon}
                    </span>
                    <span>{isCopied ? (platform.getUrl(0, "") === null ? "¡Copiada!" : "¡Copiada — pégala!") : platform.label}</span>
                  </motion.button>
                );
              })}
            </div>
            {status === "copied" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-[10px] font-mono text-cyan-600 text-center"
              >
                Imagen en portapapeles · pégala con Cmd/Ctrl+V
              </motion.p>
            )}
          </div>

          {/* Download */}
          <div className="px-5 py-4 shrink-0 mt-auto">
            <motion.button
              onClick={handleDownload}
              disabled={status === "generating"}
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-mono text-sm font-bold text-violet-300 border border-violet-500/40 hover:bg-violet-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === "generating" && activePlatform === null
                ? <><span className="inline-block animate-spin">⟳</span>GENERANDO...</>
                : <><span>⬇</span>DESCARGAR PNG</>
              }
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Off-screen full-res capture — use transform so html2canvas captures correctly */}
      <div style={{
        position: "absolute", top: 0, left: 0,
        width: fmt.width, height: fmt.height,
        transform: "translateX(-99999px)",
        pointerEvents: "none",
        overflow: "hidden",
      }} ref={captureRef}>
        <CertificateImage result={result} width={fmt.width} height={fmt.height} />
      </div>
    </motion.div>
  );
}
