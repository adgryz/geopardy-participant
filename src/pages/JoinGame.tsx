import { useContext, useState, useEffect, useRef } from "react";
import { Input, Button } from "@chakra-ui/react";
import { useHistory } from "react-router-dom";
import Webcam from "react-webcam";

import { AppContext } from "../services/SocketProvider";

import "./game.css";
import "./joinGame.css";

export const JoinGame = () => {
  const webcamRef = useRef(null);
  const { sendJoinTournament, isConnected, isTournamentJoined } =
    useContext(AppContext);
  // const [tournamentId, setTournamentId] = useState<string>("Test");
  const tournamentId = "Test";
  const [name, setName] = useState<string>("");
  const [base64Photo, setBase64Photo] = useState<string>();
  let history = useHistory();

  useEffect(() => {
    if (isTournamentJoined) {
      history.push("/lobby");
    }
  }, [isTournamentJoined]);

  const handleTakePhoto = () => {
    if (!base64Photo) {
      const imageSrc = (webcamRef.current as any).getScreenshot();
      setBase64Photo(imageSrc as string);
    } else {
      setBase64Photo(undefined);
    }
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };
  // const handleTournamentIdChange = (
  //   event: React.ChangeEvent<HTMLInputElement>
  // ) => {
  //   setTournamentId(event.currentTarget.value);
  // };
  const handleJoinTournament = () => {
    sendJoinTournament(tournamentId, name, base64Photo || "");
  };

  return (
    <div className="joinGameContainer">
      {!isConnected && <span className="loader" />}
      <div className="joinGameHeader">Dołącz do turnieju</div>
      <Input
        placeholder="Podaj imię"
        className="nameInput"
        colorScheme="primary"
        value={name}
        onChange={handleNameChange}
      />
      {base64Photo ? (
        <img className="avatar" src={base64Photo} alt="avatar" />
      ) : (
        <Webcam
          audio={false}
          mirrored
          videoConstraints={{ facingMode: "user" }}
          ref={webcamRef as any}
          screenshotFormat="image/jpeg"
        />
      )}
      <Button
        className="takePhotoButton"
        onClick={handleTakePhoto}
        colorScheme={base64Photo ? "secondary" : "primary"}
        variant={base64Photo ? "link" : "solid"}
        size="lg"
      >
        {base64Photo ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
      </Button>
      {/* <Input
        placeholder="Podaj kod turnieju"
        className="codeInput"
        value={tournamentId}
        disabled={!name}
        onChange={handleTournamentIdChange}
      /> */}
      {name && tournamentId && base64Photo && (
        <Button
          colorScheme="primary"
          disabled={!name || !tournamentId || !base64Photo}
          size="lg"
          className="joinButton"
          onClick={handleJoinTournament}
        >
          Dołącz do turnieju
        </Button>
      )}
      {isTournamentJoined === false && (
        <div>Nie udało się połączyć z serwerem</div>
      )}
    </div>
  );
};
