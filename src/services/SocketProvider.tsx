import { useState, useEffect, ReactNode, createContext } from "react";
import { useNavigate } from "react-router-dom";
import io from "socket.io-client";

const socket = io("https://geopargygame.herokuapp.com/");
// const socket = io("http://localhost:3003");

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
  const [messagesLog, setMessagesLog] = useState<string[]>([]);
  const addNewMessage = (message: string) =>
    setMessagesLog((messagesLog) => [...messagesLog, message]);

  useEffect(() => {
    socket.on(CONNECT, () => {
      addNewMessage(CONNECT);
      setIsConnected(true);
    });
    socket.on(DISCONNECT, () => {
      addNewMessage(DISCONNECT);
      setIsConnected(false);
    });

    return () => {
      socket.off(CONNECT);
      socket.off(DISCONNECT);
    };
  }, []);

  useEffect(() => {
    socket.on(RETURN_JOIN_GAME, (isSuccess: boolean) => {
      addNewMessage(RETURN_JOIN_GAME);
      setIsGameJoined(isSuccess);
    });
    return () => {
      socket.off(RETURN_JOIN_GAME);
    };
  });

  useEffect(() => {
    socket.on(RETURN_START_GAME, () => {
      addNewMessage(RETURN_START_GAME);
      navigate("/game");
    });
    return () => {
      socket.off(RETURN_START_GAME);
    };
  });

  useEffect(() => {
    socket.on(SEND_ANSWER_QUESTION, () => {
      addNewMessage(SEND_ANSWER_QUESTION);
      navigate("/game");
    });
    return () => {
      socket.off(SEND_ANSWER_QUESTION);
    };
  });

  useEffect(() => {
    socket.on(RETURN_NEW_PLAYER_SCORE, (score) => {
      addNewMessage(RETURN_NEW_PLAYER_SCORE);
      setScore(score);
      setIsOpenForAnswer(false);
    });
    return () => {
      socket.off(RETURN_NEW_PLAYER_SCORE);
    };
  });

  useEffect(() => {
    socket.on(RETURN_START_QUESTION, () => {
      addNewMessage(RETURN_START_QUESTION);
      setIsOpenForAnswer(true);
    });
    return () => {
      socket.off(RETURN_START_QUESTION);
    };
  });

  useEffect(() => {
    socket.on(RETURN_ANSWER_QUESTION_BLOCKED, () => {
      addNewMessage(RETURN_ANSWER_QUESTION_BLOCKED);
      setIsOpenForAnswer(false);
    });
    return () => {
      socket.off(RETURN_ANSWER_QUESTION_BLOCKED);
    };
  });

  useEffect(() => {
    socket.on(RETURN_ANSWER_QUESTION_OPEN, () => {
      addNewMessage(RETURN_ANSWER_QUESTION_OPEN);
      setIsOpenForAnswer(true);
    });
    return () => {
      socket.off(RETURN_ANSWER_QUESTION_OPEN);
    };
  });

  useEffect(() => {
    socket.on(RETURN_PLAYER_ANSWERED_WRONGLY, () => {
      addNewMessage(RETURN_PLAYER_ANSWERED_WRONGLY);
      setIsOpenForAnswer(false);
    });
    socket.on(RETURN_PLAYER_CAN_ANSWER, () => {
      addNewMessage(RETURN_PLAYER_CAN_ANSWER);
      setIsOpenForAnswer(true);
    });
    return () => {
      socket.off(RETURN_PLAYER_ANSWERED_WRONGLY);
      socket.off(RETURN_PLAYER_CAN_ANSWER);
    };
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
