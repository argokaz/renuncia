/**
 * In-memory store for recent scans.
 * Persists as long as the Node.js process is alive (dev server or warm Vercel lambda).
 * Resets on cold starts — intentional for a lightweight fun app.
 */

export interface RecentScan {
  name: string;
  job_title: string;
  company: string;
  score: number;
  emoji: string;
  job_id: string;
  generated_at: string;
  encoded: string; // URL-safe base64 of the full RoastResult
}

const MAX = 10;

// Module-level singleton — shared across all requests in the same process
const store: RecentScan[] = [];

export function addRecentScan(scan: RecentScan): void {
  // Avoid duplicates (same job_id)
  const idx = store.findIndex((s) => s.job_id === scan.job_id);
  if (idx !== -1) return;
  store.unshift(scan);
  if (store.length > MAX) store.pop();
}

export function getRecentScans(): RecentScan[] {
  return [...store];
}
