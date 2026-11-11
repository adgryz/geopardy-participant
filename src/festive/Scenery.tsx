import { CSSProperties, memo, useMemo } from "react";

import "./festive.css";

export type SceneryMood = "night" | "open" | "wrong" | "win";

interface ISceneryProps {
  mood?: SceneryMood;
  snow?: "snow" | "gold" | false;
  hills?: boolean;
  garland?: boolean;
  flakes?: number;
}

// Deterministyczny "los" — płatki nie przeskakują przy każdym renderze.
const rand = (seed: number) => {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

const vars = (v: Record<string, string | number>) => v as CSSProperties;

const Snow = ({ count, gold }: { count: number; gold: boolean }) => {
  const flakes = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const size = 2 + rand(i + 1) * 5;
        return {
          left: `${rand(i + 17) * 100}%`,
          style: vars({
            "--size": `${size.toFixed(1)}px`,
            "--alpha": (0.3 + rand(i + 31) * 0.6).toFixed(2),
            "--dur": `${(22 - size * 2 + rand(i + 43) * 8).toFixed(1)}s`,
            "--delay": `${(-rand(i + 59) * 24).toFixed(1)}s`,
            "--sway": `${(8 + rand(i + 71) * 26).toFixed(0)}px`,
            "--sway-dur": `${(2.5 + rand(i + 83) * 3).toFixed(1)}s`,
          }),
        };
      }),
    [count]
  );

  return (
    <div className={`snow ${gold ? "snow--gold" : ""}`}>
      {flakes.map((flake, i) => (
        <span
          key={i}
          className="snowflake"
          style={{ left: flake.left, ...flake.style }}
        >
          <i />
        </span>
      ))}
    </div>
  );
};

const Stars = () => {
  const stars = useMemo(
    () =>
      Array.from({ length: 34 }, (_, i) => {
        const size = 1.2 + rand(i + 101) * 2.2;
        return vars({
          left: `${rand(i + 113) * 100}%`,
          top: `${rand(i + 127) * 62}%`,
          width: `${size.toFixed(1)}px`,
          height: `${size.toFixed(1)}px`,
          "--dur": `${(2.6 + rand(i + 139) * 4).toFixed(1)}s`,
          "--delay": `${(-rand(i + 151) * 6).toFixed(1)}s`,
        });
      }),
    []
  );
  return (
    <>
      {stars.map((style, i) => (
        <span key={i} className="star" style={style} />
      ))}
    </>
  );
};

const Pine = ({ x, h, b }: { x: string; h: string; b: string }) => (
  <svg
    className="pine"
    viewBox="0 0 60 100"
    style={vars({ "--x": x, "--h": h, "--b": b })}
    aria-hidden
  >
    <rect x="27" y="84" width="6" height="16" fill="#050d16" />
    <path
      d="M30 2 46 32H38L52 58H42L58 88H2L18 58H8L22 32H14Z"
      fill="#081826"
    />
    <path
      d="M30 2 37 15 30 11 23 15ZM22 32 30 27 38 32 34 38 30 34 25 39ZM18 58 30 52 42 58 37 64 30 59 22 65Z"
      fill="#dfeaf2"
      opacity="0.55"
    />
  </svg>
);

const Hills = () => (
  <div className="hills">
    <svg
      className="hillShape"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 120C240 60 420 150 720 110 1000 70 1200 140 1440 90V220H0Z"
        fill="rgba(4,12,22,0.45)"
      />
    </svg>
    <Pine x="4%" h="62%" b="24%" />
    <Pine x="9%" h="84%" b="22%" />
    <Pine x="14.5%" h="50%" b="20%" />
    <Pine x="84%" h="56%" b="20%" />
    <Pine x="90%" h="88%" b="18%" />
    <Pine x="96%" h="64%" b="20%" />
    <svg
      className="hillShape"
      viewBox="0 0 1440 220"
      preserveAspectRatio="none"
      aria-hidden
    >
      <path
        d="M0 170C300 110 520 200 800 160 1050 125 1250 185 1440 150V220H0Z"
        fill="rgba(4,12,22,0.72)"
      />
      <path
        d="M0 170C300 110 520 200 800 160 1050 125 1250 185 1440 150"
        fill="none"
        stroke="#dfeaf2"
        strokeOpacity="0.4"
        strokeWidth="3"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  </div>
);

const BULB_COLORS = ["#e9c46a", "#d0434f", "#f7f0e3", "#4caf7d"];
const BULBS = [
  { x: 30, y: 14.75, r: -14 },
  { x: 90, y: 24.75, r: -5 },
  { x: 150, y: 24.75, r: 5 },
  { x: 210, y: 14.75, r: 14 },
];

const Garland = () => (
  <div className="garland" aria-hidden>
    {Array.from({ length: 12 }, (_, segment) => (
      <svg key={segment} viewBox="0 0 240 64">
        <path
          d="M0 6Q120 46 240 6"
          fill="none"
          stroke="#04101b"
          strokeWidth="2"
        />
        {BULBS.map((bulb, i) => {
          const color = BULB_COLORS[(segment * 4 + i) % BULB_COLORS.length];
          return (
            <g
              key={i}
              transform={`translate(${bulb.x} ${bulb.y}) rotate(${bulb.r})`}
            >
              <circle
                className="bulbGlow"
                cy="13"
                r="13"
                fill={color}
                style={{ animationDelay: `${-((segment * 4 + i) % 7) * 0.47}s` }}
              />
              <rect x="-3" y="0" width="6" height="6" rx="1.5" fill="#04101b" />
              <ellipse cy="13" rx="5.5" ry="8" fill={color} />
              <ellipse cx="-1.8" cy="10" rx="1.4" ry="2.6" fill="#fff" opacity="0.55" />
            </g>
          );
        })}
      </svg>
    ))}
  </div>
);

const MOODS: SceneryMood[] = ["open", "wrong", "win"];

const SceneryInternal = ({
  mood = "night",
  snow = "snow",
  hills = true,
  garland = false,
  flakes = 44,
}: ISceneryProps) => (
  <>
    <div className="scenery" aria-hidden>
      <div className="scenerySky" />
      {MOODS.map((m) => (
        <div
          key={m}
          className={`sceneryMood sceneryMood--${m} ${mood === m ? "isOn" : ""}`}
        />
      ))}
      <Stars />
      {hills && <Hills />}
      {snow && <Snow count={flakes} gold={snow === "gold"} />}
    </div>
    {garland && <Garland />}
  </>
);

export const Scenery = memo(SceneryInternal);
