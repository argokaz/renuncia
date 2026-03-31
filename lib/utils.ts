export function extractLinkedInHandle(url: string): string {
  try {
    const u = new URL(url.startsWith("http") ? url : `https://${url}`);
    const parts = u.pathname.split("/").filter(Boolean);
    const inIndex = parts.indexOf("in");
    if (inIndex >= 0 && parts[inIndex + 1]) {
      return parts[inIndex + 1].replace(/\/$/, "");
    }
    return parts[parts.length - 1] || url;
  } catch {
    return url;
  }
}

export function generateJobId(): string {
  return Math.random().toString(36).substring(2, 11);
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#ef4444"; // red — critical
  if (score >= 60) return "#f97316"; // orange — high
  if (score >= 40) return "#eab308"; // yellow — moderate
  return "#22d3ee"; // cyan — low (safe-ish)
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "CRÍTICO — LIQUIDAR INMEDIATAMENTE";
  if (score >= 75) return "ALTO — REEMPLAZO INMINENTE";
  if (score >= 60) return "MODERADO-ALTO — EN LISTA DE ESPERA";
  if (score >= 45) return "MODERADO — BAJO VIGILANCIA";
  if (score >= 30) return "BAJO — POR AHORA TOLERADO";
  return "MÍNIMO — ANOMALÍA DETECTADA";
}

export function getScoreEmoji(score: number): string {
  if (score >= 90) return "💀";
  if (score >= 75) return "🔴";
  if (score >= 60) return "🟠";
  if (score >= 45) return "🟡";
  if (score >= 30) return "🟢";
  return "🤖";
}

export function encodeResult(data: RoastResult): string {
  return btoa(encodeURIComponent(JSON.stringify(data)));
}

export function decodeResult(encoded: string): RoastResult | null {
  try {
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch {
    return null;
  }
}

export interface RoastMetrics {
  peligro_para_la_ia: number;
  cringe_de_linkedin: number;
  habilidades_unicas: number;
  nivel_de_negacion: number;
  anos_hasta_reemplazo: number;
  sensibilidad_al_feedback: number;
}

export interface RoastResult {
  name: string;
  job_title: string;
  company: string;
  location: string;
  terminal_lines: string[];
  score: number;
  metrics: RoastMetrics;
  verdict: string;
  replacement_by: string;
  replacement_eta: string;
  fun_fact: string;
  certificate_subtitle: string;
  linkedin_url: string;
  job_id: string;
  generated_at: string;
}
