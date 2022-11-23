import { useContext } from "react";
import { AppContext } from "../services/SocketProvider";

import "./waitingForGameStart.css";

export const WaitingForGameStart = () => {
  const { isTournamentStarted } = useContext(AppContext);
  return (
    <div className="waiting">
      <span className="waitingUpperText">
        {!isTournamentStarted
          ? "Oczekiwanie na start turnieju."
          : "Oczekiwanie na start Twojej gry."}
      </span>
      {!isTournamentStarted && <span className="loader" />}
      {!isTournamentStarted && <span>Zbieranie uczestników.</span>}
    </div>
  );
};
