import {
  useState,
  ReactNode,
  createContext,
  useEffect,
  useCallback,
} from "react";
import { useHistory, useLocation } from "react-router-dom";
import io from "socket.io-client";
import { v4 as uuidv4 } from "uuid";

import { playSound } from "./sound";

import "./connection.css";

const isDev = process.env.NODE_ENV === "development";
const serverAddress =
  process.env.REACT_APP_SERVER_URL ||
  (isDev ? "http://localhost:3123" : "https://geopargygame.herokuapp.com/");

const socket = io(serverAddress, {
  // come back quickly after a short network hiccup
  reconnectionDelay: 500,
  reconnectionDelayMax: 3000,
});

// ---------------------------------------------------------------------------
// Session kept in localStorage – thanks to it a player that reloads the page,
// closes the browser or loses connection comes back to the same game.
// ---------------------------------------------------------------------------
const SESSION_KEY = "geopardy.participant.session";
type Session = { playerId: string; tournamentId?: string };

const loadSession = (): Session => {
  try {
    const parsed = JSON.parse(localStorage.getItem(SESSION_KEY) || "null");
    if (parsed && typeof parsed.playerId === "string") {
      return parsed;
    }
  } catch {}
  return { playerId: uuidv4() };
};
const saveSession = (newSession: Session) => {
  session = newSession;
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
  } catch {}
};
let session = loadSession();
saveSession(session);

const CONNECT = "connect";
const DISCONNECT = "disconnect";
const RECONNECT_PARTICIPANT = "reconnectParticipant";
const RETURN_PLAYER_STATE = "returnPlayerState";

//tournament
const SEND_JOINT_TOURNAMENT = "sendJoinTournament";
const RETURN_JOIN_TOURNAMENT = "returnJoinTournament";

//questions
const SEND_ANSWER_QUESTION = "sendAnswerQuestion";

//finalQuestion
const SEND_BET_AMOUNT = "sendBetAmount";
const SEND_FINAL_QUESTION_ANSWER = "sendFinalQuestionAnswer";

export type BuzzerState =
  | "closed"
  | "open"
  | "answering"
  | "blocked"
  | "answeredWrongly";

type ParticipantView =
  | "lobby"
  | "game"
  | "finalQuestion"
  | "gameWinner"
  | "loser"
  | "tournamentWinner";

// Full state of the player sent by the server after every change
type PlayerState = {
  tournamentId: string;
  playerId: string;
  name: string;
  view: ParticipantView;
  isTournamentStarted: boolean;
  gameId: string | null;
  score: number;
  buzzer: BuzzerState;
  questionSeq: number;
  finalQuestion: {
    phase: "betting" | "answering" | "timeUp" | null;
    hasBet: boolean;
    betAmount: number | null;
    hasAnswered: boolean;
    answer: string | null;
    isCorrect: boolean | null;
  };
};

// Sounds follow the changes of the state sent by the server. The first state
// (join / reload) is silent – nothing has "happened" yet.
let lastPlayerState: PlayerState | null = null;
const playStateChangeSounds = (state: PlayerState | null) => {
  const previous = lastPlayerState;
  lastPlayerState = state;
  if (!previous || !state || previous.tournamentId !== state.tournamentId) {
    return;
  }

  // Own answer was judged
  if (previous.buzzer === "answering" && state.buzzer !== "answering") {
    if (state.score > previous.score) {
      playSound("correct");
    } else if (
      state.score < previous.score ||
      state.buzzer === "answeredWrongly"
    ) {
      playSound("wrong");
    }
  }

  if (previous.view !== state.view) {
    if (state.view === "gameWinner" || state.view === "tournamentWinner") {
      playSound("fanfare");
    } else if (state.view === "loser") {
      playSound("lose");
    } else if (state.view === "game" || state.view === "finalQuestion") {
      playSound("start");
    }
    return;
  }

  if (state.view === "game" && previous.buzzer !== state.buzzer) {
    if (state.buzzer === "answering") {
      playSound("buzz");
    } else if (state.buzzer === "open" && previous.buzzer === "closed") {
      playSound("go");
    }
  }

  if (state.view === "finalQuestion") {
    const before = previous.finalQuestion;
    const now = state.finalQuestion;
    if (now.isCorrect !== null && before.isCorrect === null) {
      playSound(now.isCorrect ? "correct" : "wrong");
    } else if (before.phase !== now.phase) {
      if (now.phase === "answering") {
        playSound("open");
      } else if (now.phase === "timeUp") {
        playSound("timeUp");
      }
    } else if (
      (now.hasBet && !before.hasBet) ||
      (now.hasAnswered && !before.hasAnswered)
    ) {
      playSound("sent");
    }
  }
};

const VIEW_PATHS: Record<ParticipantView, string> = {
  lobby: "/lobby",
  game: "/game",
  finalQuestion: "/finalQuestion",
  gameWinner: "/gameWinner",
  loser: "/loser",
  tournamentWinner: "/tournamentWinner",
};

export type JoinError =
  | "notFound"
  | "started"
  | "full"
  | "nameTaken"
  | "invalid"
  | "unknown";

interface ISocketProviderProps {
  children: ReactNode;
}

interface AppData {
  isConnected: boolean;
  isTournamentJoined?: boolean;
  isTournamentStarted: boolean;
  isJoining: boolean;
  joinError?: JoinError;
  sendJoinTournament: (
    gameId: string,
    playerName: string,
    base64Photo: string
  ) => void;

  // increases with every state received from the server
  stateVersion: number;

  score: number;
  buzzer: BuzzerState;
  isOpenForAnswer: boolean;
  sendAnswerQuestion: () => boolean;

  isBetting: boolean;
  hasBet: boolean;
  betAmount: number | null;
  hasAnswered: boolean;
  submittedAnswer: string | null;
  isAnsweringFinalQuestion: boolean;
  sendBetAmount: (betAmount: number) => void;
  sendFinalQuestionAnswer: (answer: string) => void;
  runOutOfTime: boolean;
  isFinalQuestionAnswerCorrect?: boolean;
}

export const AppContext = createContext<AppData>({
  isConnected: false,
  isJoining: false,
  sendJoinTournament: () => {},
  isTournamentStarted: false,
  stateVersion: 0,
  score: 0,
  buzzer: "closed",
  isOpenForAnswer: false,
  sendAnswerQuestion: () => false,
  isBetting: false,
  hasBet: false,
  betAmount: null,
  hasAnswered: false,
  submittedAnswer: null,
  isAnsweringFinalQuestion: false,
  runOutOfTime: false,
  sendBetAmount: () => {},
  sendFinalQuestionAnswer: () => {},
});

export const SocketProvider = ({ children }: ISocketProviderProps) => {
  const history = useHistory();
  const location = useLocation();

  const [isConnected, setIsConnected] = useState(socket.connected);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const [stateVersion, setStateVersion] = useState(0);
  // A player with a saved session waits for the server before anything is
  // shown – otherwise the join screen would flash.
  const [isRestoring, setIsRestoring] = useState(!!session.tournamentId);
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<JoinError | undefined>();

  useEffect(() => {
    const onConnect = () => {
      setIsConnected(true);
      if (session.tournamentId) {
        socket.emit(RECONNECT_PARTICIPANT, {
          playerId: session.playerId,
          tournamentId: session.tournamentId,
        });
      } else {
        setIsRestoring(false);
      }
    };
    const onDisconnect = (reason: string) => {
      setIsConnected(false);
      console.log("DISCONNECTED", reason);
    };
    const onPlayerState = (state: PlayerState | null) => {
      if (state) {
        saveSession({ playerId: state.playerId, tournamentId: state.tournamentId });
      } else {
        // Tournament does not exist anymore / player was removed
        saveSession({ playerId: session.playerId });
      }
      playStateChangeSounds(state);
      setPlayerState(state);
      setStateVersion((version) => version + 1);
      setIsRestoring(false);
    };
    const onJoinTournament = (
      result:
        | boolean
        | {
            success: boolean;
            reason?: JoinError;
            playerId?: string;
            tournamentId?: string;
          }
    ) => {
      setIsJoining(false);
      const response =
        typeof result === "boolean" ? { success: result } : result;
      if (response.success) {
        playSound("join");
        setJoinError(undefined);
        if ("tournamentId" in response && response.tournamentId) {
          saveSession({
            playerId: response.playerId || session.playerId,
            tournamentId: response.tournamentId,
          });
        }
      } else {
        setJoinError(("reason" in response && response.reason) || "unknown");
      }
    };

    socket.on(CONNECT, onConnect);
    socket.on(DISCONNECT, onDisconnect);
    socket.on(RETURN_PLAYER_STATE, onPlayerState);
    socket.on(RETURN_JOIN_TOURNAMENT, onJoinTournament);
    if (socket.connected) {
      onConnect();
    }
    return () => {
      socket.off(CONNECT, onConnect);
      socket.off(DISCONNECT, onDisconnect);
      socket.off(RETURN_PLAYER_STATE, onPlayerState);
      socket.off(RETURN_JOIN_TOURNAMENT, onJoinTournament);
    };
  }, []);

  // The screen always follows the state from the server
  useEffect(() => {
    if (isRestoring) {
      return;
    }
    const targetPath = playerState ? VIEW_PATHS[playerState.view] : "/";
    if (location.pathname !== targetPath) {
      history.replace(targetPath);
    }
  }, [playerState, isRestoring, location.pathname, history]);

  const sendJoinTournament = useCallback(
    (tournamentId: string, playerName: string, base64Photo: string) => {
      setIsJoining(true);
      setJoinError(undefined);
      socket.emit(SEND_JOINT_TOURNAMENT, {
        tournamentId,
        playerName,
        base64Photo,
        playerId: session.playerId,
      });
    },
    []
  );

  const sendAnswerQuestion = () => {
    // A buzz must never be queued and sent after a reconnect
    if (!playerState || !socket.connected) {
      return false;
    }
    socket.emit(SEND_ANSWER_QUESTION, {
      tournamentId: playerState.tournamentId,
      gameId: playerState.gameId,
      playerId: playerState.playerId,
      questionSeq: playerState.questionSeq,
    });
    return true;
  };

  // FINAL QUESTION
  const sendBetAmount = (betAmount: number) => {
    if (!playerState) return;
    socket.emit(SEND_BET_AMOUNT, {
      tournamentId: playerState.tournamentId,
      gameId: playerState.gameId,
      betAmount,
      playerId: playerState.playerId,
    });
  };
  const sendFinalQuestionAnswer = (answer: string) => {
    if (!playerState) return;
    socket.emit(SEND_FINAL_QUESTION_ANSWER, {
      tournamentId: playerState.tournamentId,
      gameId: playerState.gameId,
      answer,
      playerId: playerState.playerId,
    });
  };

  const finalQuestion = playerState?.finalQuestion;
  const finalQuestionPhase = finalQuestion?.phase ?? null;
  const isFinalQuestionAnswerCorrect =
    finalQuestion?.isCorrect === null || finalQuestion?.isCorrect === undefined
      ? undefined
      : finalQuestion.isCorrect;
  const buzzer = playerState?.buzzer ?? "closed";

  return (
    <AppContext.Provider
      value={{
        isConnected,
        isTournamentJoined: playerState ? true : undefined,
        isTournamentStarted: !!playerState?.isTournamentStarted,
        isJoining,
        joinError,
        sendJoinTournament,

        stateVersion,
        score: playerState?.score ?? 0,
        buzzer,
        isOpenForAnswer: buzzer === "open",
        sendAnswerQuestion,

        sendBetAmount,
        sendFinalQuestionAnswer,
        isBetting: finalQuestionPhase === "betting",
        hasBet: !!finalQuestion?.hasBet,
        betAmount: finalQuestion?.betAmount ?? null,
        hasAnswered: !!finalQuestion?.hasAnswered,
        submittedAnswer: finalQuestion?.answer ?? null,
        isAnsweringFinalQuestion:
          (finalQuestionPhase === "answering" ||
            finalQuestionPhase === "timeUp") &&
          isFinalQuestionAnswerCorrect === undefined,
        isFinalQuestionAnswerCorrect,
        runOutOfTime: finalQuestionPhase === "timeUp",
      }}
    >
      {isRestoring ? (
        <div className="connectionRestoring">
          <span className="loader" />
          <span>Wracamy do gry…</span>
        </div>
      ) : (
        children
      )}
      {!isConnected && !isRestoring && (
        <div className="connectionBanner">
          Brak połączenia – łączę ponownie…
        </div>
      )}
    </AppContext.Provider>
  );
};
