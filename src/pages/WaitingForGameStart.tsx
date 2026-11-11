import { useContext } from "react";
import { AppContext } from "../services/SocketProvider";
import { Scenery } from "../festive/Scenery";

import "./waitingForGameStart.css";

const SwingingBauble = () => (
  <svg className="waitingBauble" viewBox="0 0 120 190" aria-hidden>
    <defs>
      <radialGradient id="baubleFill" cx="35%" cy="30%" r="75%">
        <stop offset="0" stopColor="#e9737c" />
        <stop offset="0.55" stopColor="#b5262f" />
        <stop offset="1" stopColor="#6a1019" />
      </radialGradient>
    </defs>
    <path d="M60 0V62" stroke="#e9c46a" strokeWidth="1.5" />
    <rect x="50" y="60" width="20" height="13" rx="3" fill="#e9c46a" />
    <circle cx="60" cy="126" r="54" fill="url(#baubleFill)" />
    <path
      d="M9 112Q34 96 60 112T111 112M7 134Q34 150 60 134T113 134"
      fill="none"
      stroke="#f8e6b0"
      strokeWidth="2.5"
      strokeLinecap="round"
      opacity="0.85"
    />
    <path
      d="M60 113C60.5 119 63 122 70 123 63 124 60.500 127 60 133 59.500 127 57 124 50 123 57 122 59.500 119 60 113Z"
      fill="#f8e6b0"
    />
    <ellipse cx="40" cy="98" rx="10" ry="16" fill="#fff" opacity="0.28" transform="rotate(28 40 98)" />
  </svg>
);

export const WaitingForGameStart = () => {
  const { isTournamentStarted } = useContext(AppContext);
  return (
    <div className="stage waiting">
      <Scenery flakes={30} />
      <div className="stageContent">
        <SwingingBauble />
        <span className="waitingUpperText display">
          {!isTournamentStarted
            ? "Oczekiwanie na start turnieju."
            : "Oczekiwanie na start Twojej gry."}
        </span>
        {!isTournamentStarted && <span className="loader" />}
        {!isTournamentStarted && (
          <span className="waitingLowerText eyebrow">Zbieranie uczestników.</span>
        )}
      </div>
    </div>
  );
};
