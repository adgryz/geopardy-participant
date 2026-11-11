import { useContext, useState, useRef } from "react";
import { Input, Button } from "@chakra-ui/react";
import Webcam from "react-webcam";

import { AppContext, JoinError } from "../services/SocketProvider";
import { Scenery } from "../festive/Scenery";
import { Logo } from "../festive/Decor";

import "./game.css";
import "./joinGame.css";

const JOIN_ERROR_MESSAGES: Record<JoinError, string> = {
  notFound: "Turniej jeszcze nie istnieje – poczekaj, aż prowadzący go utworzy.",
  started: "Turniej już się rozpoczął. Jeśli grałeś, wpisz to samo imię.",
  full: "Turniej jest już pełny.",
  nameTaken:
    "To imię ma już połączony gracz. Jeśli to Ty, spróbuj ponownie za chwilę.",
  invalid: "Podaj imię.",
  unknown: "Nie udało się dołączyć. Spróbuj ponownie.",
};

export const JoinGame = () => {
  const webcamRef = useRef(null);
  const { sendJoinTournament, isConnected, isJoining, joinError } =
    useContext(AppContext);
  // const [tournamentId, setTournamentId] = useState<string>("Test");
  const tournamentId = "Test";
  const [name, setName] = useState<string>("");
  const [base64Photo, setBase64Photo] = useState<string>();
  // Navigation to the lobby is handled by SocketProvider (state from server)

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
    if (isJoining) return;
    sendJoinTournament(tournamentId, name.trim(), base64Photo || "");
  };

  return (
    <div className="stage joinGameContainer">
      <Scenery flakes={24} />
      <div className="stageContent joinGameContent">
        <Logo size={56} tagline={false} />
        <div className="joinGameHeader eyebrow">Dołącz do turnieju</div>
        {!isConnected && <span className="loader" />}

        <div className="photoFrame">
          <div className="baubleCap" />
          <div className={`photoCircle ${base64Photo ? "hasPhoto" : ""}`}>
            {base64Photo ? (
              <img className="joinAvatar" src={base64Photo} alt="avatar" />
            ) : (
              <Webcam
                className="webcamFeed"
                audio={false}
                mirrored
                videoConstraints={{ facingMode: "user" }}
                ref={webcamRef as any}
                screenshotFormat="image/jpeg"
              />
            )}
          </div>
        </div>
        <Button
          className="takePhotoButton"
          onClick={handleTakePhoto}
          colorScheme={base64Photo ? "secondary" : "primary"}
          variant={base64Photo ? "link" : "solid"}
          size="lg"
        >
          {base64Photo ? "Zmień zdjęcie" : "Dodaj zdjęcie"}
        </Button>

        <Input
          placeholder="Podaj imię"
          className="nameInput"
          colorScheme="primary"
          value={name}
          onChange={handleNameChange}
        />
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
            disabled={!name.trim() || !tournamentId || !base64Photo || isJoining}
            isLoading={isJoining}
            size="lg"
            className="joinButton"
            onClick={handleJoinTournament}
          >
            Dołącz do turnieju
          </Button>
        )}
        {joinError && (
          <div className="joinGameError">{JOIN_ERROR_MESSAGES[joinError]}</div>
        )}
      </div>
    </div>
  );
};
