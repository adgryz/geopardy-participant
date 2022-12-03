import { useState, ReactNode, createContext, useEffect } from "react";
import { useHistory } from "react-router-dom";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import { getUseSocket } from "./useSocket";

const isDev = process.env.NODE_ENV === "development";
const serverAddress = isDev
  ? "http://localhost:3123"
  : "https://geopargygame.herokuapp.com/";
const socket = io(serverAddress);
const playerId = uuidv4();

const useSocket = getUseSocket(socket);

const CONNECT = "connect";
const DISCONNECT = "disconnect";
const RECONNECT_PARTICIPANT = "reconnectParticipant";

//tournament
const SEND_JOINT_TOURNAMENT = "sendJoinTournament";
const RETURN_JOIN_TOURNAMENT = "returnJoinTournament";
const RETURN_START_TOURNAMENT = "returnStartTournament";

//games
const RETURN_START_GAME = "returnStartGame";
const RETURN_LOST_GAME = "returnLostGame";
const RETURN_WON_GAME = "returnWonGame";

//final_game
const RETURN_START_FINAL_GAME = "returnStartFinalGame";
const RETURN_WON_FINAL_GAME = "returnWonFinalGame";

//questions
const SEND_ANSWER_QUESTION = "sendAnswerQuestion";
const RETURN_NEW_PLAYER_SCORE = "returnNewPlayerScore";
const RETURN_START_QUESTION = "returnStartQuestion";
const RETURN_ANSWER_QUESTION_BLOCKED = "returnAnswerQuestionBlocked";
const RETURN_ANSWER_QUESTION_OPEN = "returnAnswerQuestionOpen";
const RETURN_PLAYER_ANSWERED_WRONGLY = "returnPlayerAnsweredWrongly";
const RETURN_PLAYER_CAN_ANSWER = "returnPlayerCanAnswer";

//finalQuestion
const RETURN_START_FINAL_QUESTION = "returnStartFinalQuestion";
const SEND_BET_AMOUNT = "sendBetAmount";
const RETURN_FINAL_QUESTION = "returnFinalQuestion";
const SEND_FINAL_QUESTION_ANSWER = "sendFinalQuestionAnswer";
const RETURN_RUN_OUT_OF_TIME = "returnRunOutOfTime";
const RETURN_IS_FINAL_QUESTION_ANSWER_CORRECT =
  "returnIsFinalQuestionAnswerCorrect";

interface ISocketProviderProps {
  children: ReactNode;
}

interface AppData {
  isConnected: boolean;
  isTournamentJoined?: boolean;
  isTournamentStarted: boolean;
  sendJoinTournament: (
    gameId: string,
    playerName: string,
    base64Photo: string
  ) => void;

  isGameWinner?: boolean;
  isTournamentWinner?: boolean;

  score: number;
  isOpenForAnswer: boolean;
  sendAnswerQuestion: () => void;

  isBetting: boolean;
  isAnsweringFinalQuestion: boolean;
  sendBetAmount: (betAmount: number) => void;
  sendFinalQuestionAnswer: (answer: string) => void;
  runOutOfTime: boolean;
  isFinalQuestionAnswerCorrect?: boolean;
}

export const AppContext = createContext<AppData>({
  isConnected: false,
  sendJoinTournament: () => {},
  isTournamentStarted: false,
  score: 0,
  isOpenForAnswer: false,
  sendAnswerQuestion: () => {},
  isBetting: false,
  isAnsweringFinalQuestion: false,
  runOutOfTime: false,
  sendBetAmount: () => {},
  sendFinalQuestionAnswer: () => {},
});

export const SocketProvider = ({ children }: ISocketProviderProps) => {
  let history = useHistory();

  useEffect(() => {
    return () => {
      if (history.action === "POP") {
        history.go(1);
      }
    };
  }, [history]);

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

  const [isFinalQuestion, setIsFinalQuestion] = useState(false);
  const [isBetting, setIsBetting] = useState(false);
  const [runOutOfTime, setRunOutOfTime] = useState(false);
  const [isAnsweringFinalQuestion, setIsAnsweringFinalQuestion] =
    useState(false);
  const [isFinalQuestionAnswerCorrect, setIsFinalQuestionAnswerCorrect] =
    useState<boolean | undefined>();

  useEffect(() => {
    console.log(
      isGameWinner,
      isPlayingFinalGame,
      "resultNavigation",
      isGameWinner === true && !isPlayingFinalGame
    );
    if (isGameWinner === true) {
      console.log("navigate gameWinner");
      history.push("/gameWinner");
    }
    if (isGameWinner === false) {
      history.push("/loser");
    }
  }, [isGameWinner]);

  useEffect(() => {
    if (isTournamentWinner) {
      history.push("/tournamentWinner");
    }
  }, [isTournamentWinner]);

  useEffect(() => {
    if (isPlayingFinalGame) {
      setScore(0);
      setIsFinalQuestion(false);
      setRunOutOfTime(false);
      setIsFinalQuestionAnswerCorrect(undefined);
      setIsBetting(false);
      history.push("/game");
    }
  }, [isPlayingFinalGame]);

  useEffect(() => {
    if (isPlayingFinalGame) {
      setScore(0);
      history.push("/game");
    }
  }, [isPlayingFinalGame]);

  useEffect(() => {
    if (isFinalQuestion) {
      history.push("/finalQuestion");
    }
  }, [isFinalQuestion]);
  useSocket(CONNECT, () => {
    setIsConnected(true);
    socket.emit(RECONNECT_PARTICIPANT, playerId);
  });
  useSocket(DISCONNECT, () => {
    setIsConnected(false);
    console.log("DISCONNECTED");
  });
  useSocket(RETURN_JOIN_TOURNAMENT, (isSuccess: boolean) => {
    setIsTournamentJoined(isSuccess);
  });

  useSocket(RETURN_START_TOURNAMENT, () => setIsTournamentStarted(true));

  useSocket(RETURN_START_GAME, ({ gameId }: { gameId: string }) => {
    setGameId(gameId);
    history.push("/game");
  });

  useSocket(RETURN_START_FINAL_GAME, ({ gameId }: { gameId: string }) => {
    setGameId(gameId);
    setIsGameWinner(undefined);
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
    console.log("setting is game winner to false", isGameWinner);
    setIsGameWinner(false);
  });
  useSocket(RETURN_WON_FINAL_GAME, () => {
    console.log("RETURN_WON_FINAL_GAME");
    setIsTournamentWinner(true);
  });

  const sendJoinTournament = (
    tournamentId: string,
    playerName: string,
    base64Photo: string
  ) => {
    socket.emit(SEND_JOINT_TOURNAMENT, {
      tournamentId,
      playerName,
      base64Photo,
      playerId,
    });
    setTournamentId(tournamentId);
  };
  const sendAnswerQuestion = () => {
    console.log(SEND_ANSWER_QUESTION, { tournamentId, gameId });
    socket.emit(SEND_ANSWER_QUESTION, { tournamentId, gameId, playerId });
  };

  // FINAL QUESTION
  useSocket(RETURN_START_FINAL_QUESTION, () => {
    setIsFinalQuestion(true);
    setIsBetting(true);
  });
  const sendBetAmount = (betAmount: number) => {
    socket.emit(SEND_BET_AMOUNT, { tournamentId, gameId, betAmount, playerId });
  };
  useSocket(RETURN_FINAL_QUESTION, () => {
    setIsBetting(false);
    setIsAnsweringFinalQuestion(true);
  });
  const sendFinalQuestionAnswer = (answer: string) => {
    socket.emit(SEND_FINAL_QUESTION_ANSWER, {
      tournamentId,
      gameId,
      answer,
      playerId,
    });
  };
  useSocket(RETURN_RUN_OUT_OF_TIME, () => {
    setRunOutOfTime(true);
  });
  useSocket(
    RETURN_IS_FINAL_QUESTION_ANSWER_CORRECT,
    ({ isCorrect, newScore }: { isCorrect: boolean; newScore: number }) => {
      setScore(newScore);
      setIsAnsweringFinalQuestion(false);
      setIsFinalQuestionAnswerCorrect(isCorrect);
    }
  );

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

        sendBetAmount,
        sendFinalQuestionAnswer,
        isBetting,
        isAnsweringFinalQuestion,
        isFinalQuestionAnswerCorrect,
        runOutOfTime,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
