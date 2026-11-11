import { Scenery } from "../../festive/Scenery";
import { Sparkle } from "../../festive/Decor";

import "./resultPages.css";

export const GameWinner = () => {
  return (
    <div className="stage resultContainer gameWinnerContainer">
      <Scenery mood="win" snow="gold" flakes={36} />
      <div className="stageContent">
        <Sparkle className="resultStar" />
        <div className="resultTitle display goldText">Wygrałeś!</div>
        <div className="resultText gameWinnerText">Czekaj na grę finałową.</div>
        <img
          alt="winnerGif"
          className="resultGif gameWinnerGif"
          src="https://i.gifer.com/8aDR.gif"
        />
      </div>
    </div>
  );
};
