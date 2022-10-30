import "./waitingForGameStart.css";

export const WaitingForGameStart = () => {
  return (
    <div className="waiting">
      <span>Oczekiwanie na start gry.</span>
      <span className="loader" />
      <span>Zbieranie uczestników.</span>
    </div>
  );
};
