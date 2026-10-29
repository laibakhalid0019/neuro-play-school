import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { ClientOnly } from "@tanstack/react-router";
import type { DotLottie } from "@lottiefiles/dotlottie-react";
import { cn } from "@/lib/utils";

/**
 * Paste the .lottie (or .json) animation URL here to show it in the left panel.
 * While it is empty — or if the animation fails to load — the inline SVG scene
 * below is shown instead.
 */
const LOTTIE_SRC = "";

// Loaded only in the browser (inside <ClientOnly>), never during SSR.
const DotLottieReact = lazy(() =>
  import("@lottiefiles/dotlottie-react").then((m) => ({ default: m.DotLottieReact })),
);

/** Deterministic star field (seeded LCG — same values on server and client). */
const STARS = (() => {
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: 30 }, () => ({
    x: Math.round(rnd() * 512 + 4),
    y: Math.round(rnd() * 150 + 8),
    r: Math.round((0.8 + rnd() * 0.8) * 10) / 10,
    delay: Math.round(rnd() * 32) / 10,
    opacity: Math.round((0.35 + rnd() * 0.5) * 100) / 100,
  }));
})();

const TRAILS = [
  { d: "M88 172 C 120 128, 200 138, 246 188", delay: 0 },
  { d: "M200 178 C 208 148, 228 152, 250 196", delay: 0.55 },
  { d: "M320 178 C 312 148, 292 152, 270 196", delay: 1.1 },
  { d: "M432 172 C 400 128, 320 138, 274 188", delay: 1.65 },
];

function Padlock({ x, y }: { x: number; y: number }) {
  return (
    <g transform={`translate(${x} ${y})`} fill="var(--amber)">
      <path d="M-3.5 0 v-3.5 a3.5 3.5 0 0 1 7 0 V0" fill="none" stroke="var(--amber)" strokeWidth="2" />
      <rect x="-6" y="0" width="12" height="9" rx="2" />
    </g>
  );
}

function School({ x }: { x: number }) {
  return (
    <g>
      <rect x={x + 4} y={206} width={72} height={42} rx={2} fill="var(--secondary)" />
      <polygon points={`${x},206 ${x + 40},178 ${x + 80},206`} fill="var(--risk)" />
      {[16, 38, 60].map((dx) => (
        <rect key={dx} x={x + dx} y={218} width={10} height={12} rx={1} fill="var(--amber)" opacity={0.85} />
      ))}
      <rect x={x + 34} y={234} width={12} height={14} rx={1} fill="var(--navy)" opacity={0.35} />
    </g>
  );
}

function Clinic({ x }: { x: number }) {
  return (
    <g>
      <rect x={x} y={200} width={64} height={48} rx={2} fill="var(--secondary)" />
      <rect x={x + 28} y={208} width={8} height={24} rx={1} fill="var(--success)" />
      <rect x={x + 20} y={216} width={24} height={8} rx={1} fill="var(--success)" />
      <rect x={x + 8} y={234} width={10} height={10} rx={1} fill="var(--amber)" opacity={0.85} />
      <rect x={x + 46} y={234} width={10} height={10} rx={1} fill="var(--amber)" opacity={0.85} />
    </g>
  );
}

/** Inline SVG fallback scene: sun rising over a school and a clinic. */
export function SunriseScene({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 520 340"
      role="img"
      aria-label="Sun rising over a school and a clinic, with secure data trails curving up to the light"
      className={cn("lumen-scene h-auto w-full", className)}
    >
      <defs>
        <linearGradient id="ls-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--navy)" />
          <stop offset="1" stopColor="var(--navy-deep)" />
        </linearGradient>
        <radialGradient id="ls-glow">
          <stop offset="0" stopColor="var(--amber)" stopOpacity="0.55" />
          <stop offset="1" stopColor="var(--amber)" stopOpacity="0" />
        </radialGradient>
      </defs>

      <rect width="520" height="340" rx="16" fill="url(#ls-sky)" />

      {STARS.map((s, i) => (
        <circle
          key={i}
          className="ls-star"
          cx={s.x}
          cy={s.y}
          r={s.r}
          fill="var(--navy-foreground)"
          opacity={s.opacity}
          style={{ animationDelay: `${s.delay}s` }}
        />
      ))}

      <circle className="ls-glow" cx="260" cy="205" r="95" fill="url(#ls-glow)" />
      <g className="ls-rays" fill="var(--amber)" opacity={0.5}>
        {Array.from({ length: 8 }).map((_, i) => (
          <rect key={i} x="257.5" y="135" width="5" height="26" rx="2.5" transform={`rotate(${i * 45} 260 205)`} />
        ))}
      </g>
      <circle cx="260" cy="205" r="34" fill="var(--amber)" />

      {TRAILS.map((t, i) => (
        <path
          key={i}
          className="ls-trail"
          d={t.d}
          fill="none"
          stroke="var(--amber)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray="0.1 11"
          opacity={0.8}
          style={{ animationDelay: `${t.delay}s` }}
        />
      ))}

      <Padlock x={88} y={162} />
      <Padlock x={200} y={176} />
      <Padlock x={320} y={176} />
      <Padlock x={432} y={162} />
      <School x={48} />
      <Clinic x={168} />
      <Clinic x={288} />
      <School x={392} />

      <path
        d="M0 262 C 90 236, 180 240, 260 252 C 340 264, 430 238, 520 250 L520 340 L0 340 Z"
        fill="var(--navy)"
        opacity={0.7}
      />
      <path
        d="M0 300 C 120 270, 210 286, 320 296 C 410 304, 470 288, 520 296 L520 340 L0 340 Z"
        fill="var(--navy-deep)"
      />

      <g fill="var(--navy)">
        <circle cx="118" cy="272" r="4.5" />
        <path d="M112 296 c0 -9 3 -13 6 -13 s6 4 6 13 Z" />
        <path d="M122 281 l7 -3 1.5 2.5 -8 4 Z" />
      </g>
      <circle className="ls-orb-glow" cx="131" cy="277" r="12" fill="url(#ls-glow)" />
      <circle cx="131" cy="277" r="4" fill="var(--cream)" />
    </svg>
  );
}

/**
 * Left-panel illustration: the DotLottie animation when a URL is configured,
 * with the inline SVG scene as the fallback (while loading, on load error, and
 * when no URL is set).
 */
export function LoginIllustration({ className }: { className?: string }) {
  const [lottieReady, setLottieReady] = useState(false);
  const [lottieFailed, setLottieFailed] = useState(false);
  const instance = useRef<DotLottie | null>(null);

  const refCallback = useCallback((inst: DotLottie | null) => {
    instance.current = inst;
    if (!inst) return;
    inst.addEventListener("load", () => setLottieReady(true));
    inst.addEventListener("loadError", () => setLottieFailed(true));
  }, []);

  const showLottie = LOTTIE_SRC !== "" && !lottieFailed;
  return (
    <div className={cn("relative mx-auto w-full max-w-[460px]", className)}>
      {showLottie && (
        <ClientOnly fallback={<SunriseScene />}>
          <Suspense fallback={<SunriseScene />}>
            <div
              aria-hidden={!lottieReady}
              className={cn(
                "absolute inset-0 transition-opacity duration-700",
                lottieReady ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <DotLottieReact src={LOTTIE_SRC} loop autoplay dotLottieRefCallback={refCallback} />
            </div>
          </Suspense>
        </ClientOnly>
      )}
      <SunriseScene className={cn(showLottie && lottieReady && "invisible")} />
    </div>
  );
}
