import "./tournamentWinner.css";

export const TournamentWinner = () => {
  return (
    <div className="tournamentWinnerContainer">
      <div className="tournamentWinnerText">
        Wygrałeś, udało Ci się pokonąć wszystkich :)
      </div>
      <img
        src="https://i.gifer.com/2Ce1.gif"
        className="tournamentWinnerGif"
        alt="tournamentWinnerGif"
      />
    </div>
  );
};
