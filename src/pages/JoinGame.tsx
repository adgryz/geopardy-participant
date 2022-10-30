import { useContext, useState, useEffect } from "react";
import { Input, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../services/SocketProvider";

import "./game.css";
import "./joinGame.css";

export const JoinGame = () => {
  const { sendJoinGame, isConnected, isGameJoined } = useContext(AppContext);
  const [gameId, setGameId] = useState<string>("");
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isGameJoined) {
      navigate("/lobby");
    }
  }, [isGameJoined, navigate]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };
  const handleGameIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setGameId(event.currentTarget.value);
  };
  const handleJoinGame = () => {
    sendJoinGame(gameId, name);
  };

  return (
    <div className="joinGameContainer">
      {!isConnected && <span className="loader" />}
      <Input
        placeholder="Podaj imię"
        className="nameInput"
        value={name}
        onChange={handleNameChange}
      />
      <Input
        placeholder="Podaj kod gry"
        className="codeInput"
        value={gameId}
        disabled={!name}
        onChange={handleGameIdChange}
      />
      <Button
        colorScheme="teal"
        disabled={!name || !gameId}
        size="lg"
        className="joinButton"
        onClick={handleJoinGame}
      >
        Dołącz do gry
      </Button>
      {isGameJoined === false && <div>Nie udało się połączyć z serwerem</div>}
    </div>
  );
};
