/**
 * In-memory store for short-key → full RoastResult.
 * Keeps the last 500 results (enough for bursts of traffic).
 * Resets on cold starts — that's acceptable; the page shows a friendly error.
 */

import type { RoastResult } from "./utils";

const MAX = 500;
const store = new Map<string, RoastResult>();

export function saveResult(key: string, result: RoastResult): void {
  if (store.size >= MAX) {
    // Evict the oldest entry
    const oldest = store.keys().next().value;
    if (oldest) store.delete(oldest);
  }
  store.set(key, result);
}

export function getResultByKey(key: string): RoastResult | null {
  return store.get(key) ?? null;
}
