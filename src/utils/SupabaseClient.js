// src/utils/SupabaseClient.js
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const HIGH_SCORES_TABLE =
  import.meta.env.VITE_SUPABASE_HIGH_SCORES_TABLE || "haunted-runner-highscores";

const baseHeaders = () => ({
  apikey: SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  "Content-Type": "application/json",
});

const ensureConfigured = () => {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    throw new Error(
      "Supabase environment variables are missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY."
    );
  }
};

const restUrl = (path, qs = "") =>
  `${SUPABASE_URL}/rest/v1/${encodeURIComponent(path)}${
    qs ? `?${qs}` : ""
  }`;

export const isSupabaseConfigured = () =>
  Boolean(SUPABASE_URL && SUPABASE_KEY);

export const insertHighScore = async ({ name, score }) => {
  ensureConfigured();

  if (import.meta.env.DEV) {
    console.log("[SupabaseClient] inserting score", { name, score });
  }

  const res = await fetch(restUrl(HIGH_SCORES_TABLE), {
    method: "POST",
    headers: { ...baseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify([{ name, score }]),
  });

  if (res.status === 409) {
    if (import.meta.env.DEV) {
      console.warn("[SupabaseClient] duplicate name detected", name);
    }
    return { duplicate: true, rows: [] };
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Insert failed: ${res.status} ${text}`);
  }

  const rows = await res.json();

  if (import.meta.env.DEV) {
    console.log("[SupabaseClient] insert response", rows);
  }

  return { duplicate: false, rows };
};

export const fetchTopScores = async (limit = 10) => {
  ensureConfigured();

  const qs = new URLSearchParams({
    select: "name,score,created_at",
    order: "score.desc.nullslast",
    limit: String(Math.max(1, limit)),
  }).toString();

  if (import.meta.env.DEV) {
    console.log("[SupabaseClient] fetching top scores", { limit });
  }

  const res = await fetch(restUrl(HIGH_SCORES_TABLE, qs), {
    headers: baseHeaders(),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Fetch top scores failed: ${res.status} ${text}`);
  }

  const rows = await res.json();

  if (import.meta.env.DEV) {
    console.log("[SupabaseClient] fetched top scores", rows);
  }

  return rows;
};
