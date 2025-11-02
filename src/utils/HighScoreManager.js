// src/utils/HighScoreManager.js
import { insertHighScore, isSupabaseConfigured } from "./SupabaseClient";

export const MIN_NAME_LENGTH = 3;
export const MAX_NAME_LENGTH = 20;
export const NAME_PATTERN = /^[A-Za-z0-9\s\-']+$/;

const BANNED_TERMS = [
  "fuck","shit","bitch","cunt","asshole","bastard","nigger","faggot","porn","sex",
];

const normalize = (v = "") => v.toLowerCase().replace(/[^a-z0-9]+/g, "");
const hasProfanity = (v = "") => !!v && BANNED_TERMS.some(t => normalize(v).includes(t));

export const sanitizeName = (v = "") => v.trim().replace(/\s+/g, " ");

export const validateName = (name) => {
  if (!name) return { valid: false, message: "Please enter your name." };
  if (name.length < MIN_NAME_LENGTH) return { valid: false, message: `Name too short (min ${MIN_NAME_LENGTH} characters).` };
  if (name.length > MAX_NAME_LENGTH) return { valid: false, message: `Name too long (max ${MAX_NAME_LENGTH} characters).` };
  if (!NAME_PATTERN.test(name)) return { valid: false, message: "Invalid characters. Use letters, numbers, spaces, hyphens, apostrophes." };
  if (hasProfanity(name)) return { valid: false, message: "Display name rejected. Please choose a different name." };
  return { valid: true };
};

// DB enforces case-insensitive uniqueness via unique index on lower(name).
export const submitScore = async ({ name, score }) => {
  const sanitizedName = sanitizeName(name);
  const validation = validateName(sanitizedName);

  if (import.meta.env.DEV) {
    console.log("[HighScoreManager] submitScore called", { name: sanitizedName, rawScore: score });
  }

  if (!validation.valid) {
    return { success: false, error: validation.message, sanitizedName };
  }

  if (!Number.isFinite(score)) {
    return { success: false, error: "Score missing or invalid.", sanitizedName };
  }

  if (!isSupabaseConfigured()) {
    return {
      success: false,
      error: "Supabase is not configured. Provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
      sanitizedName,
    };
  }

  const safeScore = Math.max(0, Math.floor(score));

  try {
    const result = await insertHighScore({ name: sanitizedName, score: safeScore });

    // insertHighScore must return { duplicate: boolean, rows: [...] } or throw.
    if (result?.duplicate) {
      return {
        success: false,
        error: "Name already exists. Pick a unique display name.",
        sanitizedName,
      };
    }

    const record = Array.isArray(result?.rows) ? result.rows[0] : result?.rows ?? null;

    return { success: true, sanitizedName, record };
  } catch (err) {
    if (import.meta.env.DEV) console.error("[HighScoreManager] insert failed", err);
    // 409 fallback if client didn’t unwrap duplicate
    if (String(err).includes("409")) {
      return {
        success: false,
        error: "Name already exists. Pick a unique display name.",
        sanitizedName,
      };
    }
    return { success: false, error: "Submission failed. Please try again later.", sanitizedName };
  }
};
