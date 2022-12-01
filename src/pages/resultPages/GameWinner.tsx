import "./gameWinner.css";

export const GameWinner = () => {
  return (
    <div className="gameWinnerContainer">
      <div className="gameWinnerText">Wygrałeś. Czekaj na grę finałową.</div>
      <img
        alt="winnerGif"
        className="gameWinnerGif"
        src="https://i.gifer.com/8aDR.gif"
      />
    </div>
  );
};
