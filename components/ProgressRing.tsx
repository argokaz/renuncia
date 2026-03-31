"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { getScoreColor, getScoreLabel } from "@/lib/utils";

interface ProgressRingProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animate?: boolean;
}

export default function ProgressRing({
  score,
  size = 200,
  strokeWidth = 10,
  animate = true,
}: ProgressRingProps) {
  const [displayScore, setDisplayScore] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = getScoreColor(score);

  useEffect(() => {
    if (!animate) {
      setDisplayScore(score);
      return;
    }
    let frame: number;
    const start = performance.now();
    const duration = 1500;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayScore(Math.round(eased * score));
      if (progress < 1) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [score, animate]);

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow ring */}
      <div
        className="absolute inset-0 rounded-full opacity-30 blur-xl"
        style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }}
      />

      {/* SVG Ring */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="rotate-[-90deg]"
      >
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />

        {/* Secondary decorative rings */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius - strokeWidth - 4}
          fill="none"
          stroke="rgba(34,211,238,0.05)"
          strokeWidth={1}
          strokeDasharray="4 8"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius + strokeWidth / 2 + 2}
          fill="none"
          stroke="rgba(34,211,238,0.08)"
          strokeWidth={1}
        />

        {/* Main progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1] }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}80) drop-shadow(0 0 16px ${color}40)`,
          }}
        />

        {/* Tick marks */}
        {Array.from({ length: 10 }).map((_, i) => {
          const angle = (i / 10) * 2 * Math.PI - Math.PI / 2;
          const innerR = radius - strokeWidth - 8;
          const outerR = radius - strokeWidth - 2;
          const x1 = size / 2 + innerR * Math.cos(angle);
          const y1 = size / 2 + innerR * Math.sin(angle);
          const x2 = size / 2 + outerR * Math.cos(angle);
          const y2 = size / 2 + outerR * Math.sin(angle);
          return (
            <line
              key={i}
              x1={x1} y1={y1} x2={x2} y2={y2}
              stroke="rgba(34,211,238,0.3)"
              strokeWidth={1}
            />
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-xs font-mono text-slate-500 tracking-widest uppercase mb-1">
          ÍNDICE
        </div>
        <motion.div
          className="font-mono font-bold leading-none"
          style={{
            fontSize: size * 0.28,
            color,
            textShadow: `0 0 20px ${color}80, 0 0 40px ${color}40`,
          }}
        >
          {displayScore}
        </motion.div>
        <div className="text-xs font-mono text-slate-500 tracking-widest mt-1">
          /100
        </div>
      </div>
    </div>
  );
}
