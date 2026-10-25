import { CURRICULUM_DB } from "./curriculum-db.js?v=30";

const normalizeToken = (token) => {
  if (token === ",") return "~";
  const match = token.match(/^([srgmpdn])(\.)?$/i);
  if (!match) return null;
  const [, letter, lowerMark] = match;
  const base = letter.toUpperCase();
  if (lowerMark) return `${base}-`;
  return letter === base ? `${base}+` : base;
};

const parseNotation = (notation) => notation
  .split(/\s+/)
  .filter((token) => !["|", "||", "-"].includes(token))
  .map((token) => {
    const normalized = normalizeToken(token);
    if (!normalized) throw new Error(`Invalid swara token: ${token}`);
    return normalized;
  });

export const AUTHORS = CURRICULUM_DB.authors;
export const SOURCES = CURRICULUM_DB.sources;
export const SCHOOL_TRACKS = CURRICULUM_DB.schoolTracks;
export const RAGAS = CURRICULUM_DB.ragas;
export const TALAS = CURRICULUM_DB.talas;

export const CURRICULUM = [...CURRICULUM_DB.sections]
  .sort((a, b) => a.order - b.order)
  .map((section) => ({
    ...section,
    lessons: CURRICULUM_DB.lessons
      .filter((item) => item.sectionId === section.id)
      .sort((a, b) => a.sequence - b.sequence)
      .map((item) => ({
        ...item,
        number: String(item.sequence).padStart(2, "0"),
        raga: item.ragaId,
        tala: item.talaId,
        phrases: item.notation.map((row) => ({
          id: row.id,
          label: row.label,
          tamilLabel: row.tamilLabel,
          notes: parseNotation(row.swaras),
          sourceNotation: row.swaras
        }))
      }))
  }));

export const SHRUTIS = {
  "C4": { name: "C", frequency: 261.63 },
  "C#4": { name: "C♯", frequency: 277.18 },
  "D4": { name: "D", frequency: 293.66 },
  "D#4": { name: "D♯", frequency: 311.13 },
  "E4": { name: "E", frequency: 329.63 },
  "F4": { name: "F", frequency: 349.23 },
  "F#4": { name: "F♯", frequency: 369.99 },
  "G4": { name: "G", frequency: 392.0 },
  "G#4": { name: "G♯", frequency: 415.3 },
  "A4": { name: "A", frequency: 440.0 },
  "A#4": { name: "A♯", frequency: 466.16 },
  "B4": { name: "B", frequency: 493.88 }
};

export const TAMIL_SWARAS = {
  S: "ஸ", R: "ரி", G: "க", M: "ம", P: "ப", D: "த", N: "நி", "~": ","
};

export { CURRICULUM_DB };
