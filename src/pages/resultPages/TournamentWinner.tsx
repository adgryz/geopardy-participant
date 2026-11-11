import { Scenery } from "../../festive/Scenery";
import { Sparkle } from "../../festive/Decor";

import "./resultPages.css";

export const TournamentWinner = () => {
  return (
    <div className="stage resultContainer tournamentWinnerContainer">
      <Scenery mood="win" snow="gold" flakes={50} />
      <div className="stageContent">
        <Sparkle className="resultStar" />
        <div className="resultTitle display goldText">Wygrałeś!</div>
        <div className="resultText tournamentWinnerText">
          Udało Ci się pokonać wszystkich :)
        </div>
        <img
          src="https://i.gifer.com/2Ce1.gif"
          className="resultGif tournamentWinnerGif"
          alt="tournamentWinnerGif"
        />
      </div>
    </div>
  );
};
