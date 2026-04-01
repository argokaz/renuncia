"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RoastResult, getScoreColor, getScoreLabel } from "@/lib/utils";
import html2canvas from "html2canvas";

interface Format {
  id: string;
  label: string;
  subtitle: string;
  width: number;
  height: number;
  landscape: boolean;
}

const FORMATS: Format[] = [
  { id: "stories",  label: "Stories",   subtitle: "Instagram Stories · 9:16",  width: 1080, height: 1920, landscape: false },
  { id: "post",     label: "Post",       subtitle: "Instagram / Facebook · 1:1", width: 1080, height: 1080, landscape: false },
  { id: "linkedin", label: "LinkedIn",   subtitle: "LinkedIn Post · 1.91:1",     width: 1200, height: 628,  landscape: true  },
  { id: "twitter",  label: "Twitter/X",  subtitle: "Twitter / X · 16:9",         width: 1200, height: 675,  landscape: true  },
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
    id: "twitter",
    label: "Twitter / X",
    icon: "𝕏",
    color: "#1d9bf0",
    getUrl: (score, name) =>
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(
        `Mi índice de obsolescencia es ${score}/100 🤖\n"${name}" será reemplazado por IA.\n\n¿Cuál es el tuyo? 👇`
      )}&url=${encodeURIComponent("https://renuncia.vercel.app")}`,
  },
  {
    id: "linkedin",
    label: "LinkedIn",
    icon: "in",
    color: "#0a66c2",
    getUrl: (_score, _name) =>
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://renuncia.vercel.app")}`,
  },
  {
    id: "facebook",
    label: "Facebook",
    icon: "f",
    color: "#1877f2",
    getUrl: () =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent("https://renuncia.vercel.app")}`,
  },
  {
    id: "instagram",
    label: "Instagram",
    icon: "◎",
    color: "#e1306c",
    getUrl: () => null, // No web composer — just copy image
  },
];

// ─── Certificate image component ───────────────────────────────────────────
function CertificateImage({ result, width, height }: { result: RoastResult; width: number; height: number }) {
  const scoreColor = getScoreColor(result.score);
  const isLandscape = width > height;
  const isSquare = Math.abs(width - height) < 50;

  // Font scale relative to width
  const s = (n: number) => Math.round((n / 1080) * width);

  return (
    <div
      style={{
        width,
        height,
        background: "#020817",
        position: "relative",
        overflow: "hidden",
        fontFamily: "'Courier New', Courier, monospace",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
      }}
    >
      {/* Vignette */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 120% 100% at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)",
        pointerEvents: "none",
      }} />

      {/* Grid */}
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `linear-gradient(rgba(34,211,238,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.04) 1px, transparent 1px)`,
        backgroundSize: `${s(60)}px ${s(60)}px`,
      }} />

      {/* Score glow blob */}
      <div style={{
        position: "absolute",
        top: isLandscape ? "50%" : "28%",
        left: isLandscape ? "22%" : "50%",
        transform: "translate(-50%, -50%)",
        width: s(isLandscape ? 400 : 600),
        height: s(isLandscape ? 400 : 600),
        background: `radial-gradient(circle, ${scoreColor}25 0%, transparent 70%)`,
        borderRadius: "50%",
        pointerEvents: "none",
      }} />

      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: s(6), background: scoreColor }} />

      {/* Corner marks */}
      {[
        { top: s(20), left: s(20) },
        { top: s(20), right: s(20) },
        { bottom: s(20), left: s(20) },
        { bottom: s(20), right: s(20) },
      ].map((pos, i) => (
        <div key={i} style={{
          position: "absolute", ...pos,
          width: s(32), height: s(32),
          borderTop: i < 2 ? `${s(3)}px solid ${scoreColor}60` : undefined,
          borderBottom: i >= 2 ? `${s(3)}px solid ${scoreColor}60` : undefined,
          borderLeft: (i === 0 || i === 2) ? `${s(3)}px solid ${scoreColor}60` : undefined,
          borderRight: (i === 1 || i === 3) ? `${s(3)}px solid ${scoreColor}60` : undefined,
        }} />
      ))}

      {isLandscape ? (
        // ── LANDSCAPE LAYOUT ──────────────────────────────────
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: s(48), gap: s(28), position: "relative" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: s(14) }}>
              <div style={{
                width: s(44), height: s(44), borderRadius: s(8),
                border: `${s(2)}px solid rgba(34,211,238,0.4)`,
                background: "rgba(34,211,238,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: s(22), color: "#22d3ee", fontWeight: "bold",
              }}>Γ</div>
              <span style={{ fontSize: s(26), fontWeight: "bold", color: "white", letterSpacing: "-0.02em" }}>
                renunc<span style={{ color: "#22d3ee" }}>IA</span>
              </span>
            </div>
            <span style={{ fontSize: s(13), color: "rgba(148,163,184,0.5)", letterSpacing: "0.14em", textTransform: "uppercase" }}>
              CERTIFICADO DE OBSOLESCENCIA
            </span>
          </div>

          {/* Main content row */}
          <div style={{ flex: 1, display: "flex", gap: s(48), alignItems: "center" }}>
            {/* Score column */}
            <div style={{ textAlign: "center", minWidth: s(240) }}>
              <div style={{
                fontSize: s(160), fontWeight: "900", color: scoreColor,
                lineHeight: 1, letterSpacing: "-0.06em",
                textShadow: `0 0 ${s(40)}px ${scoreColor}80`,
              }}>
                {result.score}
              </div>
              <div style={{
                fontSize: s(14), color: scoreColor, letterSpacing: "0.18em",
                textTransform: "uppercase", marginTop: s(8), opacity: 0.9,
              }}>
                ÍNDICE DE<br />OBSOLESCENCIA
              </div>
            </div>

            {/* Divider */}
            <div style={{ width: s(2), alignSelf: "stretch", background: `linear-gradient(180deg, transparent, ${scoreColor}50, transparent)` }} />

            {/* Info column */}
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: s(20) }}>
              <div>
                <div style={{ fontSize: s(14), color: "rgba(100,116,139,0.9)", letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: s(8) }}>
                  SUJETO EVALUADO
                </div>
                <div style={{ fontSize: s(32), fontWeight: "bold", color: "white", lineHeight: 1.15, marginBottom: s(6) }}>
                  {result.name}
                </div>
                <div style={{ fontSize: s(18), color: "#22d3ee", marginBottom: s(4) }}>
                  {result.job_title}
                </div>
                <div style={{ fontSize: s(15), color: "rgba(148,163,184,0.6)" }}>
                  {result.company}
                </div>
              </div>

              <div style={{
                background: "rgba(255,255,255,0.03)",
                border: `${s(1)}px solid rgba(255,255,255,0.07)`,
                borderRadius: s(10), padding: `${s(16)}px ${s(20)}px`,
              }}>
                <div style={{ fontSize: s(16), color: "rgba(226,232,240,0.85)", lineHeight: 1.65 }}>
                  {result.verdict.length > 180 ? result.verdict.substring(0, 180) + "…" : result.verdict}
                </div>
              </div>

              <div style={{ display: "flex", gap: s(24) }}>
                <div>
                  <div style={{ fontSize: s(12), color: "rgba(100,116,139,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Reemplazado por</div>
                  <div style={{ fontSize: s(15), color: "#fb923c", marginTop: s(4), fontWeight: "bold" }}>{result.replacement_by}</div>
                </div>
                <div style={{ width: s(1), background: "rgba(255,255,255,0.1)" }} />
                <div>
                  <div style={{ fontSize: s(12), color: "rgba(100,116,139,0.8)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Fecha estimada</div>
                  <div style={{ fontSize: s(15), color: scoreColor, marginTop: s(4), fontWeight: "bold" }}>{result.replacement_eta}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: "flex", justifyContent: "space-between", alignItems: "center",
            paddingTop: s(16), borderTop: `${s(1)}px solid rgba(255,255,255,0.06)`,
          }}>
            <span style={{ fontSize: s(13), color: "rgba(71,85,105,0.9)", letterSpacing: "0.05em" }}>
              SISTEMA-Γ · División RRHH Automatizados
            </span>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: s(16), color: scoreColor, fontWeight: "bold", letterSpacing: "0.04em" }}>
                renuncia.vercel.app
              </div>
              <div style={{ fontSize: s(11), color: "rgba(71,85,105,0.6)", marginTop: s(3), letterSpacing: "0.04em" }}>
                hecho con amor por Arturo Goga
              </div>
            </div>
          </div>
        </div>
      ) : (
        // ── PORTRAIT / SQUARE LAYOUT ──────────────────────────
        <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: s(56), gap: s(isSquare ? 24 : 36), position: "relative" }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", alignItems: "center", gap: s(14) }}>
              <div style={{
                width: s(48), height: s(48), borderRadius: s(9),
                border: `${s(2)}px solid rgba(34,211,238,0.4)`,
                background: "rgba(34,211,238,0.12)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: s(24), color: "#22d3ee", fontWeight: "bold",
              }}>Γ</div>
              <span style={{ fontSize: s(28), fontWeight: "bold", color: "white", letterSpacing: "-0.02em" }}>
                renunc<span style={{ color: "#22d3ee" }}>IA</span>
              </span>
            </div>
            <div style={{
              padding: `${s(8)}px ${s(14)}px`,
              border: `${s(1)}px solid ${scoreColor}50`,
              borderRadius: s(100),
              background: `${scoreColor}12`,
            }}>
              <span style={{ fontSize: s(12), color: scoreColor, letterSpacing: "0.12em", textTransform: "uppercase" }}>
                CERTIFICADO OFICIAL
              </span>
            </div>
          </div>

          {/* Score hero */}
          <div style={{ textAlign: "center" }}>
            <div style={{
              fontSize: s(isSquare ? 180 : 220), fontWeight: "900", color: scoreColor,
              lineHeight: 1, letterSpacing: "-0.06em",
              textShadow: `0 0 ${s(60)}px ${scoreColor}70`,
            }}>
              {result.score}
            </div>
            <div style={{
              fontSize: s(isSquare ? 16 : 18), color: scoreColor, letterSpacing: "0.2em",
              textTransform: "uppercase", marginTop: s(isSquare ? 4 : 8), opacity: 0.85,
            }}>
              ÍNDICE DE OBSOLESCENCIA
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: s(1), background: `linear-gradient(90deg, transparent, ${scoreColor}50, transparent)` }} />

          {/* Person */}
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: s(isSquare ? 36 : 44), fontWeight: "bold", color: "white", lineHeight: 1.2, marginBottom: s(10) }}>
              {result.name}
            </div>
            <div style={{ fontSize: s(isSquare ? 22 : 26), color: "#22d3ee", marginBottom: s(8) }}>
              {result.job_title}
            </div>
            <div style={{ fontSize: s(isSquare ? 17 : 20), color: "rgba(148,163,184,0.6)" }}>
              {result.company}
            </div>
          </div>

          {/* Verdict */}
          <div style={{
            background: "rgba(255,255,255,0.03)",
            border: `${s(1)}px solid rgba(255,255,255,0.08)`,
            borderRadius: s(14),
            padding: `${s(isSquare ? 22 : 30)}px ${s(28)}px`,
            textAlign: "center",
            flex: isSquare ? 0 : 1,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <div style={{ fontSize: s(isSquare ? 18 : 22), color: "rgba(226,232,240,0.9)", lineHeight: 1.7 }}>
              {result.verdict}
            </div>
          </div>

          {/* ETA row */}
          <div style={{ display: "flex", justifyContent: "center", gap: s(32) }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: s(13), color: "rgba(100,116,139,0.9)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: s(6) }}>
                Reemplazado por
              </div>
              <div style={{ fontSize: s(isSquare ? 18 : 22), color: "#fb923c", fontWeight: "bold" }}>
                {result.replacement_by}
              </div>
            </div>
            <div style={{ width: s(1), background: "rgba(255,255,255,0.1)", alignSelf: "stretch" }} />
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: s(13), color: "rgba(100,116,139,0.9)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: s(6) }}>
                Fecha estimada
              </div>
              <div style={{ fontSize: s(isSquare ? 18 : 22), color: scoreColor, fontWeight: "bold" }}>
                {result.replacement_eta}
              </div>
            </div>
          </div>

          {/* Footer CTA */}
          <div style={{
            paddingTop: s(20),
            borderTop: `${s(1)}px solid rgba(255,255,255,0.06)`,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span style={{ fontSize: s(14), color: "rgba(71,85,105,0.9)", letterSpacing: "0.04em" }}>
              SISTEMA-Γ · {new Date(result.generated_at).getFullYear()}
            </span>
            <div style={{ textAlign: "right" }}>
              <div style={{
                fontSize: s(isSquare ? 18 : 22), color: scoreColor, fontWeight: "bold", letterSpacing: "0.04em",
              }}>
                renuncia.vercel.app
              </div>
              <div style={{ fontSize: s(11), color: "rgba(71,85,105,0.6)", marginTop: s(4), letterSpacing: "0.04em" }}>
                hecho con amor por Arturo Goga
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom accent */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: s(3), background: `linear-gradient(90deg, transparent, ${scoreColor}60, transparent)` }} />
    </div>
  );
}

// ─── Modal ──────────────────────────────────────────────────────────────────
interface ShareImageModalProps {
  result: RoastResult;
  onClose: () => void;
}

export default function ShareImageModal({ result, onClose }: ShareImageModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("stories");
  const [status, setStatus] = useState<"idle" | "generating" | "copied">("idle");
  const [activePlatform, setActivePlatform] = useState<string | null>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const fmt = FORMATS.find((f) => f.id === selectedFormat)!;

  const maxPreviewW = 300;
  const maxPreviewH = 440;
  const scaleByW = maxPreviewW / fmt.width;
  const scaleByH = maxPreviewH / fmt.height;
  const previewScale = Math.min(scaleByW, scaleByH);
  const previewW = Math.round(fmt.width * previewScale);
  const previewH = Math.round(fmt.height * previewScale);

  const generateBlob = useCallback(async (): Promise<Blob | null> => {
    if (!captureRef.current) return null;
    const canvas = await html2canvas(captureRef.current, {
      scale: 1,
      useCORS: true,
      backgroundColor: "#020817",
      logging: false,
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
    } catch (err) {
      console.error("Error generando imagen:", err);
    } finally {
      setStatus("idle");
    }
  };

  const handleSharePlatform = async (platform: SharePlatform) => {
    setStatus("generating");
    setActivePlatform(platform.id);
    try {
      const blob = await generateBlob();
      if (!blob) return;

      // Copy image to clipboard
      try {
        await navigator.clipboard.write([
          new ClipboardItem({ "image/png": blob }),
        ]);
        setStatus("copied");
      } catch {
        // Clipboard write might fail in some browsers — still open the URL
        setStatus("idle");
      }

      // Open platform composer
      const shareUrl = platform.getUrl(result.score, result.name);
      if (shareUrl) {
        setTimeout(() => window.open(shareUrl, "_blank", "noopener"), 300);
      }

      setTimeout(() => { setStatus("idle"); setActivePlatform(null); }, 3000);
    } catch (err) {
      console.error("Error:", err);
      setStatus("idle");
      setActivePlatform(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,8,23,0.93)", backdropFilter: "blur(14px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel-strong rounded-2xl overflow-hidden w-full flex"
        style={{
          border: "1px solid rgba(255,255,255,0.08)",
          maxHeight: "94vh",
          maxWidth: 820,
        }}
      >
        {/* LEFT — preview */}
        <div className="flex flex-col items-center justify-center bg-black/20 p-6 gap-3 shrink-0">
          <p className="text-xs font-mono text-slate-600 tracking-wider">{fmt.subtitle}</p>
          <div style={{
            width: previewW, height: previewH, overflow: "hidden",
            borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)", flexShrink: 0,
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

          {/* Share platforms */}
          <div className="px-5 py-3 border-b border-white/5 shrink-0">
            <p className="text-[10px] font-mono text-slate-600 tracking-widest uppercase mb-2">
              Compartir en
              <span className="ml-2 text-slate-700 normal-case tracking-normal">(copia imagen + abre la app)</span>
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
                    className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg font-mono text-xs border transition-all disabled:opacity-50"
                    style={{
                      borderColor: isCopied ? "#22d3ee50" : `${platform.color}35`,
                      color: isCopied ? "#22d3ee" : platform.color,
                      background: isCopied ? "rgba(34,211,238,0.08)" : `${platform.color}10`,
                    }}
                  >
                    <span style={{
                      width: 22, height: 22, borderRadius: 4,
                      background: `${platform.color}25`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 11, fontWeight: "bold", flexShrink: 0,
                    }}>
                      {isLoading ? "⟳" : platform.icon}
                    </span>
                    <span>
                      {isCopied
                        ? platform.getUrl(0, "") === null
                          ? "¡Imagen copiada!"
                          : "¡Copiada — pegala!"
                        : platform.label}
                    </span>
                  </motion.button>
                );
              })}
            </div>
            {status === "copied" && (
              <motion.p
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-[10px] font-mono text-cyan-600 text-center"
              >
                Imagen en portapapeles · pégala en tu publicación con Cmd/Ctrl+V
              </motion.p>
            )}
          </div>

          {/* Download */}
          <div className="px-5 py-4 shrink-0 mt-auto">
            <motion.button
              onClick={handleDownload}
              disabled={status === "generating"}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 rounded-xl font-mono text-sm font-bold text-violet-300 border border-violet-500/40 hover:bg-violet-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {status === "generating" && activePlatform === null ? (
                <><span className="inline-block animate-spin">⟳</span>GENERANDO...</>
              ) : (
                <><span>⬇</span>DESCARGAR PNG</>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Off-screen full-res capture target */}
      <div style={{ position: "fixed", left: -99999, top: 0, width: fmt.width, height: fmt.height, pointerEvents: "none", zIndex: -1 }}
        ref={captureRef}>
        <CertificateImage result={result} width={fmt.width} height={fmt.height} />
      </div>
    </motion.div>
  );
}
