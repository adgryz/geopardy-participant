import { useState, useEffect, ReactNode, createContext } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

import { getUseSocket } from "./useSocket";

const socket = io("https://geopargygame.herokuapp.com/");
// const socket = io("http://localhost:3003");

const useSocket = getUseSocket(socket);

const CONNECT = "connect";
const DISCONNECT = "disconnect";

const SEND_JOIN_GAME = "sendJoinGame";
const SEND_ANSWER_QUESTION = "sendAnswerQuestion";

const RETURN_JOIN_GAME = "returnJoinGame";
const RETURN_START_GAME = "returnStartGame";
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
  isGameJoined?: boolean;
  sendJoinGame: (gameId: string, playerName: string) => void;

  score: number;
  isOpenForAnswer: boolean;
  sendAnswerQuestion: () => void;
}

export const AppContext = createContext<AppData>({
  isConnected: false,
  sendJoinGame: () => {},

  score: 0,
  isOpenForAnswer: false,
  sendAnswerQuestion: () => {},
});

export const SocketProvider = ({ children }: ISocketProviderProps) => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isGameJoined, setIsGameJoined] = useState<boolean | undefined>();
  const [gameId, setGameId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [isOpenForAnswer, setIsOpenForAnswer] = useState(false);

  useSocket(CONNECT, () => setIsConnected(true));
  useSocket(CONNECT, () => setIsConnected(false));
  useSocket(RETURN_JOIN_GAME, (isSuccess: boolean) => {
    setIsGameJoined(isSuccess);
  });

  useSocket(RETURN_START_GAME, () => {
    navigate("/game");
  });

  useSocket(SEND_ANSWER_QUESTION, () => {
    navigate("/game");
  }); // do we need it?

  useSocket(RETURN_NEW_PLAYER_SCORE, (score) => {
    setScore(score);
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

  const sendJoinGame = (gameId: string, playerName: string) => {
    socket.emit(SEND_JOIN_GAME, { gameId, playerName });
    setGameId(gameId);
  };

  const sendAnswerQuestion = () => {
    socket.emit(SEND_ANSWER_QUESTION);
  };

  return (
    <AppContext.Provider
      value={{
        isConnected,
        isGameJoined,
        sendJoinGame,

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
