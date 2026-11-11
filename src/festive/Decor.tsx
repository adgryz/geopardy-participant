import { CSSProperties } from "react";

import "./festive.css";

export const Sparkle = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 0C13 7 17 11 24 12 17 13 13 17 12 24 11 17 7 13 0 12 7 11 11 7 12 0Z" />
  </svg>
);

export const Logo = ({
  size = 120,
  tagline = true,
}: {
  size?: number | string;
  tagline?: boolean;
}) => (
  <div className="logo" style={{ fontSize: size }}>
    <Sparkle className="logoStar" />
    <div className="logoWord display goldText">Geopardy</div>
    {tagline && (
      <div className="logoTagline">
        <i />
        Świąteczny turniej wiedzy
        <i />
      </div>
    )}
  </div>
);

export const Avatar = ({
  src,
  name = "",
  size = 64,
  className = "",
}: {
  src?: string;
  name?: string;
  size?: number | string;
  className?: string;
}) => {
  const style = {
    "--size": typeof size === "number" ? `${size}px` : size,
  } as CSSProperties;
  return src ? (
    <img className={`avatar ${className}`} style={style} src={src} alt={name} />
  ) : (
    <div className={`avatar ${className}`} style={style}>
      {name.trim().charAt(0).toUpperCase() || "?"}
    </div>
  );
};

const LEAF_COLORS = ["#1f5a48", "#2d7a5f", "#174a3a"];
const BERRIES = [20, 95, 160, 215, 300];

// Wieniec — awatar zwycięzcy wkładamy do środka.
export const Wreath = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 200 200" aria-hidden>
    {Array.from({ length: 40 }, (_, i) => {
      const angle = i * 9;
      const radius = i % 2 ? 86 : 76;
      return (
        <ellipse
          key={i}
          cx="100"
          cy={100 - radius}
          rx="6.5"
          ry="17"
          fill={LEAF_COLORS[i % 3]}
          transform={`rotate(${angle} 100 100) rotate(${i % 2 ? 62 : -58} 100 ${
            100 - radius
          })`}
        />
      );
    })}
    {BERRIES.map((angle) => (
      <g key={angle} transform={`rotate(${angle} 100 100)`}>
        <circle cx="96" cy="19" r="4.6" fill="#d0434f" />
        <circle cx="105" cy="21" r="4.2" fill="#b5262f" />
        <circle cx="100" cy="27" r="3.8" fill="#d0434f" />
        <circle cx="95" cy="17.6" r="1.2" fill="#fff" opacity="0.6" />
      </g>
    ))}
    <g transform="translate(100 182)">
      <path d="M0 0-26-13Q-34 0-26 13ZM0 0 26-13Q34 0 26 13Z" fill="#e9c46a" />
      <path d="M-4 4-14 30-5 25 0 32 2 6ZM4 4 14 30 5 25 0 32-2 6Z" fill="#c9973a" />
      <circle r="6.5" fill="#f8e6b0" />
    </g>
  </svg>
);
