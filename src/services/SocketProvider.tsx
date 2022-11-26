import { useState, ReactNode, createContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

import { getUseSocket } from "./useSocket";

// const socket = io("https://geopargygame.herokuapp.com/");
const socket = io("http://localhost:3123");

const useSocket = getUseSocket(socket);

const CONNECT = "connect";
const DISCONNECT = "disconnect";

//tournament
const SEND_JOINT_TOURNAMENT = "sendJoinTournament";
const RETURN_JOIN_TOURNAMENT = "returnJoinTournament";
const RETURN_START_TOURNAMENT = "returnStartTournament";

//games
const RETURN_START_GAME = "returnStartGame";
const RETURN_LOST_GAME = "returnLostGame";
const RETURN_WON_GAME = "returnWonGame";
const RETURN_FINAL_GAME_START = "returnFinalGameStart";

//final_game
const RETURN_START_FINAL_GAME = "returnStartFinalGame";

//questions
const SEND_ANSWER_QUESTION = "sendAnswerQuestion";
const RETURN_NEW_PLAYER_SCORE = "returnNewPlayerScore";
const RETURN_START_QUESTION = "returnStartQuestion";
const RETURN_ANSWER_QUESTION_BLOCKED = "returnAnswerQuestionBlocked";
const RETURN_ANSWER_QUESTION_OPEN = "returnAnswerQuestionOpen";
const RETURN_PLAYER_ANSWERED_WRONGLY = "returnPlayerAnsweredWrongly";
const RETURN_PLAYER_CAN_ANSWER = "returnPlayerCanAnswer";

interface ISocketProviderProps {
  children: ReactNode;
}

interface AppData {
  isConnected: boolean;
  isTournamentJoined?: boolean;
  isTournamentStarted: boolean;
  sendJoinTournament: (gameId: string, playerName: string) => void;

  isGameWinner?: boolean;
  isTournamentWinner?: boolean;

  score: number;
  isOpenForAnswer: boolean;
  sendAnswerQuestion: () => void;
}

export const AppContext = createContext<AppData>({
  isConnected: false,
  sendJoinTournament: () => {},
  isTournamentStarted: false,
  score: 0,
  isOpenForAnswer: false,
  sendAnswerQuestion: () => {},
});

export const SocketProvider = ({ children }: ISocketProviderProps) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isTournamentJoined, setIsTournamentJoined] =
    useState<boolean | undefined>();
  const [isTournamentStarted, setIsTournamentStarted] = useState(false);
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [isTournamentWinner, setIsTournamentWinner] =
    useState<boolean | undefined>();

  const [isPlayingFinalGame, setIsPlayingFinalGame] =
    useState<boolean | undefined>();

  const [gameId, setGameId] = useState<string | null>(null);
  const [isGameWinner, setIsGameWinner] = useState<boolean | undefined>();

  const [score, setScore] = useState(0);
  const [isOpenForAnswer, setIsOpenForAnswer] = useState(false);

  useEffect(() => {
    if (isGameWinner === true && !isPlayingFinalGame) {
      navigate("/gameWinner");
    }
    if (isGameWinner === false && !isPlayingFinalGame) {
      navigate("/loser");
    }
  }, [isGameWinner, navigate, isPlayingFinalGame]);

  useEffect(() => {
    if (isPlayingFinalGame) {
      setScore(0);
      navigate("/game");
    }
  }, [isPlayingFinalGame, navigate]);

  useSocket(CONNECT, () => setIsConnected(true));
  useSocket(DISCONNECT, () => setIsConnected(false));
  useSocket(RETURN_JOIN_TOURNAMENT, (isSuccess: boolean) => {
    setIsTournamentJoined(isSuccess);
  });

  useSocket(RETURN_START_TOURNAMENT, () => setIsTournamentStarted(true));

  useSocket(RETURN_START_GAME, ({ gameId }: { gameId: string }) => {
    setGameId(gameId);
    navigate("/game");
  });

  useSocket(RETURN_START_FINAL_GAME, ({ gameId }: { gameId: string }) => {
    setGameId(gameId);
    setIsPlayingFinalGame(true);
  });

  useSocket(RETURN_NEW_PLAYER_SCORE, ({ newScore }) => {
    setScore(newScore);
    setIsOpenForAnswer(false);
  });
  useSocket(RETURN_START_QUESTION, () => {
    setIsOpenForAnswer(true);
  });
  useSocket(RETURN_ANSWER_QUESTION_BLOCKED, () => {
    setIsOpenForAnswer(false);
  });
  useSocket(RETURN_ANSWER_QUESTION_OPEN, () => {
    setIsOpenForAnswer(true);
  });
  useSocket(RETURN_PLAYER_ANSWERED_WRONGLY, () => {
    setIsOpenForAnswer(false);
  });
  useSocket(RETURN_PLAYER_CAN_ANSWER, () => {
    setIsOpenForAnswer(true);
  });
  useSocket(RETURN_WON_GAME, () => {
    setIsGameWinner(true);
  });
  useSocket(RETURN_LOST_GAME, () => {
    setIsGameWinner(false);
  });

  const sendJoinTournament = (tournamentId: string, playerName: string) => {
    socket.emit(SEND_JOINT_TOURNAMENT, { tournamentId, playerName });
    setTournamentId(tournamentId);
  };

  const sendAnswerQuestion = () => {
    console.log(SEND_ANSWER_QUESTION, { tournamentId, gameId });
    socket.emit(SEND_ANSWER_QUESTION, { tournamentId, gameId });
  };

  return (
    <AppContext.Provider
      value={{
        isConnected,
        isTournamentJoined,
        isTournamentStarted,
        sendJoinTournament,

        score,
        isOpenForAnswer,
        sendAnswerQuestion,
      }}
    >
      {/* <div>
        {messagesLog.map((msg) => (
          <div key={msg}>{msg}</div>
        ))}
      </div> */}
      {children}
    </AppContext.Provider>
  );
};
