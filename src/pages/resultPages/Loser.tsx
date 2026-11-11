import { Scenery } from "../../festive/Scenery";

import "./resultPages.css";

export const Loser = () => {
  return (
    <div className="stage resultContainer loserContainer">
      <Scenery flakes={40} />
      <div className="stageContent">
        <div className="resultTitle display loserText">
          Niestety przegrywasz
        </div>
        <img
          alt="pikapikasad"
          className="resultGif loserGif"
          src="https://i.gifer.com/XZ9.gif"
        />
      </div>
    </div>
  );
};
