"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  { id: "stories", label: "Stories", subtitle: "Instagram Stories · 9:16", width: 1080, height: 1920 },
  { id: "post", label: "Post", subtitle: "Instagram / Facebook · 1:1", width: 1080, height: 1080 },
  { id: "linkedin", label: "LinkedIn", subtitle: "LinkedIn Post · 1.91:1", width: 1200, height: 628 },
  { id: "twitter", label: "Twitter/X", subtitle: "Twitter / X · 16:9", width: 1200, height: 675 },
];

function CertificateImage({
  result,
  width,
  height,
}: {
  result: RoastResult;
  width: number;
  height: number;
}) {
  const scoreColor = getScoreColor(result.score);
  const isPortrait = height > width;
  const pad = isPortrait ? 80 : 56;
  const scoreFontSize = isPortrait ? 200 : 130;
  const nameFontSize = isPortrait ? 44 : 30;
  const titleFontSize = isPortrait ? 28 : 20;
  const bodyFontSize = isPortrait ? 22 : 15;
  const smallFontSize = isPortrait ? 18 : 13;

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
        padding: pad,
        boxSizing: "border-box",
      }}
    >
      {/* Grid */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `linear-gradient(rgba(34,211,238,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.025) 1px, transparent 1px)`,
          backgroundSize: "50px 50px",
        }}
      />
      {/* Top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 5,
          background: scoreColor,
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          marginBottom: isPortrait ? 70 : 36,
          position: "relative",
        }}
      >
        <div
          style={{
            width: isPortrait ? 52 : 40,
            height: isPortrait ? 52 : 40,
            borderRadius: 10,
            border: `1px solid rgba(34,211,238,0.3)`,
            background: "rgba(34,211,238,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: isPortrait ? 24 : 18,
            color: "#22d3ee",
            fontWeight: "bold",
          }}
        >
          Γ
        </div>
        <span
          style={{
            color: "white",
            fontSize: isPortrait ? 32 : 24,
            fontWeight: "bold",
            letterSpacing: "-0.02em",
          }}
        >
          renunc
          <span style={{ color: "#22d3ee" }}>IA</span>
        </span>
        <span
          style={{
            marginLeft: "auto",
            fontSize: smallFontSize - 2,
            color: "rgba(148,163,184,0.4)",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
          }}
        >
          CERTIFICADO OFICIAL
        </span>
      </div>

      {/* Score */}
      <div style={{ textAlign: "center", position: "relative" }}>
        <div
          style={{
            fontSize: scoreFontSize,
            fontWeight: "900",
            color: scoreColor,
            lineHeight: 1,
            letterSpacing: "-0.05em",
          }}
        >
          {result.score}
        </div>
        <div
          style={{
            fontSize: isPortrait ? 22 : 14,
            color: scoreColor,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            marginTop: 10,
            opacity: 0.85,
          }}
        >
          ÍNDICE DE OBSOLESCENCIA
        </div>
      </div>

      {/* Name + title */}
      <div
        style={{
          textAlign: "center",
          marginTop: isPortrait ? 50 : 28,
          padding: "0 20px",
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: nameFontSize,
            fontWeight: "bold",
            color: "white",
            marginBottom: 8,
          }}
        >
          {result.name}
        </div>
        <div
          style={{
            fontSize: titleFontSize,
            color: "#22d3ee",
            marginBottom: 6,
          }}
        >
          {result.job_title}
        </div>
        <div style={{ fontSize: smallFontSize, color: "rgba(148,163,184,0.6)" }}>
          {result.company}
        </div>
      </div>

      {/* Verdict */}
      <div
        style={{
          background: "rgba(255,255,255,0.025)",
          border: `1px solid rgba(255,255,255,0.06)`,
          borderRadius: 14,
          padding: isPortrait ? "32px 44px" : "20px 28px",
          textAlign: "center",
          marginTop: isPortrait ? 50 : 24,
          position: "relative",
        }}
      >
        <div
          style={{
            fontSize: bodyFontSize,
            color: "rgba(226,232,240,0.85)",
            lineHeight: 1.65,
          }}
        >
          {result.verdict}
        </div>
      </div>

      {/* ETA + replacement */}
      <div
        style={{
          display: "flex",
          gap: 24,
          justifyContent: "center",
          marginTop: isPortrait ? 44 : 20,
          position: "relative",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: smallFontSize - 2,
              color: "rgba(100,116,139,0.9)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Reemplazado por
          </div>
          <div style={{ fontSize: bodyFontSize, color: "#fb923c" }}>
            {result.replacement_by}
          </div>
        </div>
        <div
          style={{
            width: 1,
            background: "rgba(255,255,255,0.08)",
            alignSelf: "stretch",
          }}
        />
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              fontSize: smallFontSize - 2,
              color: "rgba(100,116,139,0.9)",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginBottom: 6,
            }}
          >
            Fecha estimada
          </div>
          <div
            style={{
              fontSize: bodyFontSize,
              color: scoreColor,
              fontWeight: "bold",
            }}
          >
            {result.replacement_eta}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: "auto",
          paddingTop: 20,
          borderTop: "1px solid rgba(255,255,255,0.06)",
          position: "relative",
        }}
      >
        <span
          style={{
            fontSize: smallFontSize - 1,
            color: "rgba(71,85,105,0.9)",
            letterSpacing: "0.05em",
          }}
        >
          SISTEMA-Γ · División RRHH Automatizados
        </span>
        <span
          style={{
            fontSize: smallFontSize - 1,
            color: "rgba(71,85,105,0.9)",
            fontWeight: "bold",
          }}
        >
          renuncIA.vercel.app
        </span>
      </div>

      {/* Bottom accent */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, transparent, ${scoreColor}60, transparent)`,
        }}
      />
    </div>
  );
}

interface ShareImageModalProps {
  result: RoastResult;
  onClose: () => void;
}

export default function ShareImageModal({ result, onClose }: ShareImageModalProps) {
  const [selectedFormat, setSelectedFormat] = useState<string>("stories");
  const [isGenerating, setIsGenerating] = useState(false);
  const captureRef = useRef<HTMLDivElement>(null);

  const fmt = FORMATS.find((f) => f.id === selectedFormat)!;

  // Scale the preview to fit within ~320px wide / ~480px tall
  const maxPreviewW = 320;
  const maxPreviewH = 480;
  const scaleByW = maxPreviewW / fmt.width;
  const scaleByH = maxPreviewH / fmt.height;
  const previewScale = Math.min(scaleByW, scaleByH);
  const previewW = Math.round(fmt.width * previewScale);
  const previewH = Math.round(fmt.height * previewScale);

  const handleDownload = async () => {
    if (!captureRef.current || isGenerating) return;
    setIsGenerating(true);
    try {
      const canvas = await html2canvas(captureRef.current, {
        scale: 1,
        useCORS: true,
        backgroundColor: "#020817",
        logging: false,
      });
      const url = canvas.toDataURL("image/png");
      const a = document.createElement("a");
      a.href = url;
      a.download = `renuncia-${result.name.replace(/\s+/g, "-").toLowerCase()}-${selectedFormat}.png`;
      a.click();
    } catch (err) {
      console.error("Error generando imagen:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(2,8,23,0.92)", backdropFilter: "blur(12px)" }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="glass-panel-strong rounded-2xl overflow-hidden w-full max-w-xl flex flex-col"
        style={{ border: "1px solid rgba(255,255,255,0.08)", maxHeight: "92vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 shrink-0">
          <div>
            <h3 className="font-mono font-bold text-white">COMPARTIR IMAGEN</h3>
            <p className="text-xs font-mono text-slate-500 mt-0.5">
              Descarga tu certificado en el formato que quieras
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors font-mono text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5"
          >
            ✕
          </button>
        </div>

        {/* Format tabs */}
        <div className="flex gap-2 px-5 py-3 border-b border-white/5 overflow-x-auto shrink-0">
          {FORMATS.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFormat(f.id)}
              className={`px-3 py-1.5 rounded-lg font-mono text-xs whitespace-nowrap transition-all ${
                selectedFormat === f.id
                  ? "bg-violet-500/20 border border-violet-500/50 text-violet-300"
                  : "border border-white/10 text-slate-500 hover:border-white/20 hover:text-slate-400"
              }`}
            >
              {f.label}
              <span className="ml-1.5 opacity-50">{f.subtitle.split("·")[1]?.trim()}</span>
            </button>
          ))}
        </div>

        {/* Preview area */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col items-center gap-3 min-h-0">
          <p className="text-xs font-mono text-slate-600 shrink-0">
            {fmt.subtitle} · {fmt.width}×{fmt.height}px
          </p>

          {/* Preview — CSS-scaled */}
          <div
            style={{
              width: previewW,
              height: previewH,
              overflow: "hidden",
              borderRadius: 8,
              flexShrink: 0,
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div
              style={{
                width: fmt.width,
                height: fmt.height,
                transform: `scale(${previewScale})`,
                transformOrigin: "top left",
              }}
            >
              <CertificateImage result={result} width={fmt.width} height={fmt.height} />
            </div>
          </div>
        </div>

        {/* Off-screen capture target at full resolution */}
        <div
          style={{
            position: "fixed",
            left: -99999,
            top: 0,
            width: fmt.width,
            height: fmt.height,
            pointerEvents: "none",
            zIndex: -1,
          }}
          ref={captureRef}
        >
          <CertificateImage result={result} width={fmt.width} height={fmt.height} />
        </div>

        {/* Actions */}
        <div className="px-5 py-4 border-t border-white/5 flex gap-3 shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-3 rounded-xl font-mono text-sm border border-white/10 text-slate-400 hover:bg-white/5 transition-all"
          >
            Cancelar
          </button>
          <motion.button
            onClick={handleDownload}
            disabled={isGenerating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 py-3 rounded-xl font-mono text-sm font-bold text-violet-300 border border-violet-500/50 hover:bg-violet-500/10 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <span className="inline-block animate-spin">⟳</span>
                GENERANDO...
              </>
            ) : (
              <>
                <span>⬇</span>
                DESCARGAR PNG
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
