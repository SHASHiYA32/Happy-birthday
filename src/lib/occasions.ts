// Shared by server and client code. Adding an occasion means adding one entry here,
// one artwork in OccasionArt.tsx, one song in birthday-song.ts and one value in the
// database check constraint (supabase/migrations/001_occasions.sql).

export const OCCASION_IDS = ["birthday", "vesak", "valentine", "christmas"] as const;
export type OccasionId = (typeof OCCASION_IDS)[number];
export type ConfettiVariant = "confetti" | "snow" | "petals" | "hearts";

export type Occasion = {
  id: OccasionId;
  /** Short name used in chips and the hero word carousel. */
  label: string;
  /** "birthday card", "Christmas card"... used in sentences. */
  noun: string;
  blurb: string;
  /** Colour for text/icons on the paper background. */
  accent: string;
  /** Card cover background and the text colour on it. */
  cover: string;
  coverInk: string;
  /** Background of the closing screen (cream text sits on it). */
  endBg: string;
  coverGreeting: string;
  insideGreeting: string;
  /** Handwritten line on the inside-left page. */
  coverInside: string;
  gateScript: string;
  dateLabel: string;
  dateHelp: string;
  /** "MM-DD" to pre-fill the date, or null when the date moves every year. */
  defaultMonthDay: string | null;
  wishPlaceholder: string;
  confetti: ConfettiVariant;
  /** Background / text colour pairs the slideshow cycles through. */
  palette: { bg: string; fg: string }[];
};

export const OCCASIONS: Record<OccasionId, Occasion> = {
  birthday: {
    id: "birthday",
    label: "Birthday",
    noun: "birthday card",
    blurb: "Cake, candles and a music-box song.",
    accent: "#e2492f",
    cover: "#e2492f",
    coverInk: "#fff8ec",
    endBg: "#e2492f",
    coverGreeting: "Happy Birthday",
    insideGreeting: "Happy birthday,",
    coverInside: "make a wish",
    gateScript: "Psst.",
    dateLabel: "Their birthday",
    dateHelp: "The card stays shut until this day, then opens with the code.",
    defaultMonthDay: null,
    wishPlaceholder: "Write it the way you'd say it…",
    confetti: "confetti",
    palette: [
      { bg: "#f3e9d6", fg: "#221b17" },
      { bg: "#e2492f", fg: "#fff8ec" },
      { bg: "#f3b232", fg: "#221b17" },
      { bg: "#1d5a55", fg: "#fff8ec" },
      { bg: "#f1b9ae", fg: "#221b17" },
    ],
  },
  vesak: {
    id: "vesak",
    label: "Vesak",
    noun: "Vesak card",
    blurb: "Lotus, dharma wheel and a calm singing-bowl melody.",
    accent: "#b87a08",
    cover: "#f3b232",
    coverInk: "#221b17",
    endBg: "#1d5a55",
    coverGreeting: "Happy Vesak",
    insideGreeting: "Happy Vesak,",
    coverInside: "be at peace",
    gateScript: "Peace be with you.",
    dateLabel: "Vesak day",
    dateHelp: "Pick the Vesak Poya day. The card stays shut until then.",
    defaultMonthDay: null,
    wishPlaceholder: "Share a blessing or a kind thought…",
    confetti: "petals",
    palette: [
      { bg: "#f3e9d6", fg: "#221b17" },
      { bg: "#f3b232", fg: "#221b17" },
      { bg: "#1d5a55", fg: "#fff8ec" },
      { bg: "#7a2e1d", fg: "#fff8ec" },
      { bg: "#f1b9ae", fg: "#221b17" },
    ],
  },
  valentine: {
    id: "valentine",
    label: "Valentine's",
    noun: "Valentine's card",
    blurb: "Hearts, soft pinks and a gentle music-box waltz.",
    accent: "#d93a5e",
    cover: "#f1b9ae",
    coverInk: "#221b17",
    endBg: "#d93a5e",
    coverGreeting: "With Love",
    insideGreeting: "Happy Valentine's,",
    coverInside: "yours always",
    gateScript: "Someone's thinking of you.",
    dateLabel: "Valentine's Day",
    dateHelp: "The card stays shut until this day, then opens with the code.",
    defaultMonthDay: "02-14",
    wishPlaceholder: "Say the thing you've been meaning to say…",
    confetti: "hearts",
    palette: [
      { bg: "#f3e9d6", fg: "#221b17" },
      { bg: "#f1b9ae", fg: "#221b17" },
      { bg: "#d93a5e", fg: "#fff8ec" },
      { bg: "#5a1a2b", fg: "#fff8ec" },
      { bg: "#f6d6cf", fg: "#221b17" },
    ],
  },
  christmas: {
    id: "christmas",
    label: "Christmas",
    noun: "Christmas card",
    blurb: "Snow, a glowing tree and a jingling tune.",
    accent: "#1f6b4a",
    cover: "#1b4d3e",
    coverInk: "#fff8ec",
    endBg: "#1b4d3e",
    coverGreeting: "Merry Christmas",
    insideGreeting: "Merry Christmas,",
    coverInside: "ho ho ho",
    gateScript: "Ho ho ho!",
    dateLabel: "Christmas Day",
    dateHelp: "The card stays shut until this day, then opens with the code.",
    defaultMonthDay: "12-25",
    wishPlaceholder: "Warm wishes for the season…",
    confetti: "snow",
    palette: [
      { bg: "#f3e9d6", fg: "#221b17" },
      { bg: "#1b4d3e", fg: "#fff8ec" },
      { bg: "#c9302c", fg: "#fff8ec" },
      { bg: "#f3b232", fg: "#221b17" },
      { bg: "#16324a", fg: "#fff8ec" },
    ],
  },
};

export const OCCASION_LIST = OCCASION_IDS.map((id) => OCCASIONS[id]);

export function isOccasion(value: unknown): value is OccasionId {
  return typeof value === "string" && (OCCASION_IDS as readonly string[]).includes(value);
}

/** Next calendar occurrence of "MM-DD" as YYYY-MM-DD (today counts). Empty when there is no fixed date. */
export function nextOccurrence(monthDay: string | null, now = new Date()): string {
  if (!monthDay) return "";
  const [m, d] = monthDay.split("-").map(Number);
  let year = now.getFullYear();
  const today = new Date(year, now.getMonth(), now.getDate());
  if (new Date(year, m - 1, d) < today) year += 1;
  return `${year}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}
