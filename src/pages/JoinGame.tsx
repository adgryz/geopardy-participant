import { useContext, useState, useEffect } from "react";
import { Input, Button } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

import { AppContext } from "../services/SocketProvider";

import "./game.css";
import "./joinGame.css";

export const JoinGame = () => {
  const { sendJoinTournament, isConnected, isTournamentJoined } =
    useContext(AppContext);
  const [tournamentId, setTournamentId] = useState<string>("Test");
  const [name, setName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    if (isTournamentJoined) {
      navigate("/lobby");
    }
  }, [isTournamentJoined, navigate]);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };
  const handleTournamentIdChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setTournamentId(event.currentTarget.value);
  };
  const handleJoinTournament = () => {
    sendJoinTournament(tournamentId, name);
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
        placeholder="Podaj kod turnieju"
        className="codeInput"
        value={tournamentId}
        disabled={!name}
        onChange={handleTournamentIdChange}
      />
      <Button
        colorScheme="teal"
        disabled={!name || !tournamentId}
        size="lg"
        className="joinButton"
        onClick={handleJoinTournament}
      >
        Dołącz do turnieju
      </Button>
      {isTournamentJoined === false && (
        <div>Nie udało się połączyć z serwerem</div>
      )}
    </div>
  );
};
