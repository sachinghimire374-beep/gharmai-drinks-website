// SQLite stores images/tags as JSON text. These helpers convert at the boundary
// so the rest of the app works with real arrays.

export function parseArr(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  if (typeof v === "string") {
    try { const a = JSON.parse(v); return Array.isArray(a) ? a : []; } catch { return []; }
  }
  return [];
}

export function stringifyArr(v: unknown): string {
  if (Array.isArray(v)) return JSON.stringify(v);
  if (typeof v === "string") {
    // already JSON? keep it; else wrap
    try { JSON.parse(v); return v; } catch { return JSON.stringify([v]); }
  }
  return "[]";
}

// Normalize a product row coming from Prisma into API/UI shape (arrays).
export function productOut<T extends { images: unknown; tags: unknown }>(p: T) {
  return { ...p, images: parseArr(p.images), tags: parseArr(p.tags) };
}
