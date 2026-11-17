import type { OccasionId } from "@/lib/occasions";

const INK = "#221b17";
const CREAM = "#fff8ec";

const HEART =
  "M100 168 C 40 124 24 84 44 60 C 62 40 92 48 100 74 C 108 48 138 40 156 60 C 176 84 160 124 100 168 Z";

const f = (n: number) => n.toFixed(2);

function Cake() {
  return (
    <>
      <ellipse cx="100" cy="176" rx="78" ry="9" fill={INK} opacity=".25" />
      <rect x="38" y="112" width="124" height="58" rx="6" fill={CREAM} stroke={INK} strokeWidth="4" />
      <path d="M38 126c12 14 22-6 34 8s22-8 34 6 22-8 34 6 14-4 22 2" fill="none" stroke="#f1b9ae" strokeWidth="9" strokeLinecap="round" />
      <rect x="58" y="76" width="84" height="40" rx="6" fill="#f3b232" stroke={INK} strokeWidth="4" />
      <path d="M58 90c10 12 18-5 28 6s18-8 28 4 18-6 28 2" fill="none" stroke={CREAM} strokeWidth="7" strokeLinecap="round" />
      {[78, 100, 122].map((x) => (
        <g key={x}>
          <rect x={x - 3} y="52" width="6" height="26" fill="#1d5a55" stroke={INK} strokeWidth="3" />
          <path d={`M${x} 28c9 9 8 18 0 21-8-3-9-12 0-21z`} fill={CREAM} stroke={INK} strokeWidth="3" />
        </g>
      ))}
    </>
  );
}

function Tree() {
  return (
    <>
      <ellipse cx="100" cy="182" rx="74" ry="8" fill={INK} opacity=".25" />
      <rect x="91" y="158" width="18" height="20" fill="#8a5a3c" stroke={INK} strokeWidth="4" />
      <g fill="#2f8f5f" stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <polygon points="100,86 46,162 154,162" />
        <polygon points="100,58 58,124 142,124" />
        <polygon points="100,34 70,86 130,86" />
      </g>
      <polygon
        transform="translate(0 -4)"
        points="100,18 103.3,27.5 113.3,27.7 105.3,33.7 108.2,43.3 100,37.6 91.8,43.3 94.7,33.7 86.7,27.7 96.7,27.5"
        fill="#f3b232"
        stroke={INK}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      {[
        [92, 76, "#e2492f"],
        [110, 104, "#f3b232"],
        [84, 124, CREAM],
        [118, 142, "#e2492f"],
        [70, 150, "#f3b232"],
        [104, 70, CREAM],
      ].map(([x, y, c]) => (
        <circle key={`${x}${y}`} cx={x as number} cy={y as number} r="4.5" fill={c as string} stroke={INK} strokeWidth="2.5" />
      ))}
      <g stroke={INK} strokeWidth="4" strokeLinejoin="round">
        <rect x="26" y="150" width="36" height="28" fill="#e2492f" />
        <rect x="41" y="150" width="6" height="28" fill={CREAM} strokeWidth="2.5" />
        <rect x="140" y="158" width="32" height="20" fill="#f3b232" />
        <rect x="154" y="158" width="6" height="20" fill={CREAM} strokeWidth="2.5" />
      </g>
    </>
  );
}

function Lotus() {
  const spokes = Array.from({ length: 8 }, (_, k) => {
    const a = (k * Math.PI) / 4;
    return { x1: 100 + 14 * Math.cos(a), y1: 100 + 14 * Math.sin(a), x2: 100 + 58 * Math.cos(a), y2: 100 + 58 * Math.sin(a) };
  });
  return (
    <>
      {/* dharma wheel glowing behind the lotus */}
      <circle cx="100" cy="100" r="68" fill="#fff3c9" stroke={INK} strokeWidth="4" />
      <circle cx="100" cy="100" r="58" fill="none" stroke={INK} strokeWidth="2" />
      {spokes.map((s, i) => (
        <line key={i} x1={f(s.x1)} y1={f(s.y1)} x2={f(s.x2)} y2={f(s.y2)} stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      ))}
      {/* lotus */}
      <g stroke={INK} strokeWidth="3.5" strokeLinejoin="round">
        <path d="M100 146 C 62 154 34 128 28 98 C 58 98 88 114 100 146 Z" fill={CREAM} />
        <path d="M100 146 C 138 154 166 128 172 98 C 142 98 112 114 100 146 Z" fill={CREAM} />
        <path d="M100 146 C 70 130 52 98 56 64 C 80 80 96 108 100 146 Z" fill="#f1b9ae" />
        <path d="M100 146 C 130 130 148 98 144 64 C 120 80 104 108 100 146 Z" fill="#f1b9ae" />
        <path d="M100 38 C 120 70 120 112 100 146 C 80 112 80 70 100 38 Z" fill="#fff8ec" />
      </g>
      <path d="M100 52 C 108 76 108 104 100 128" fill="none" stroke="#f1b9ae" strokeWidth="3" strokeLinecap="round" />
      {/* water */}
      <path d="M22 156 Q61 144 100 156 T178 156" fill="none" stroke={INK} strokeWidth="3.5" strokeLinecap="round" />
      <ellipse cx="52" cy="172" rx="24" ry="6" fill="#1d5a55" stroke={INK} strokeWidth="3" />
      <ellipse cx="152" cy="174" rx="22" ry="5.5" fill="#1d5a55" stroke={INK} strokeWidth="3" />
    </>
  );
}

function Heart({ x, y, s, fill }: { x: number; y: number; s: number; fill: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d={HEART} transform="translate(-100 -110)" fill={fill} stroke={INK} strokeWidth={4 / s > 14 ? 14 : 4 / s} strokeLinejoin="round" />
    </g>
  );
}

function Valentine() {
  return (
    <>
      <ellipse cx="100" cy="184" rx="60" ry="7" fill={INK} opacity=".22" />
      <path d={HEART} fill="#d93a5e" stroke={INK} strokeWidth="4" strokeLinejoin="round" />
      <path d="M58 72 C 62 62 74 58 84 64" fill="none" stroke={CREAM} strokeWidth="6" strokeLinecap="round" />
      <path d="M52 86 C 53 82 55 80 57 79" fill="none" stroke={CREAM} strokeWidth="5" strokeLinecap="round" />
      <Heart x={156} y={36} s={0.3} fill="#e2492f" />
      <Heart x={44} y={40} s={0.24} fill="#fff8ec" />
      <Heart x={168} y={150} s={0.2} fill="#fff8ec" />
      {[[22, 112], [180, 96]].map(([x, y]) => (
        <path key={`${x}${y}`} d={`M${x} ${y - 7}V${y + 7}M${x - 7} ${y}H${x + 7}`} stroke={INK} strokeWidth="3" strokeLinecap="round" />
      ))}
    </>
  );
}

export default function OccasionArt({ occasion, className }: { occasion: OccasionId; className?: string }) {
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden>
      {occasion === "birthday" && <Cake />}
      {occasion === "christmas" && <Tree />}
      {occasion === "vesak" && <Lotus />}
      {occasion === "valentine" && <Valentine />}
    </svg>
  );
}
