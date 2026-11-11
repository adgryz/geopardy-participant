import { faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState, useEffect, useRef } from "react";

import { AppContext } from "../services/SocketProvider";
import { playSound } from "../services/sound";

import { Scenery } from "../festive/Scenery";

import "./game.css";

const TIME_TO_ANSWER = 20;
const FALSE_START_PENALTY = 2;

export const Game = () => {
  const { score, buzzer, stateVersion, sendAnswerQuestion } =
    useContext(AppContext);
  const [timeToAnswer, setTimeToAnswer] = useState<number | null>(null);
  const [isFalseStart, setIsFalseStart] = useState(false);
  // Buzz sent, waiting for the server to decide who was first
  const [isPending, setIsPending] = useState(false);
  const falseStartTimeout = useRef<ReturnType<typeof setTimeout>>();
  const pendingTimeout = useRef<ReturnType<typeof setTimeout>>();

  // The buzzer state comes from the server – the player answers only when
  // the server accepted the buzz, so two players can never answer at once.
  const isOpenForAnswer = buzzer === "open";
  const isAnswering = buzzer === "answering";
  const canAnswer = !isAnswering && !isFalseStart && !isPending && isOpenForAnswer;
  const isWaiting = !isAnswering && !isFalseStart && !isPending && !canAnswer;

  const handleAnswer = () => {
    if (isAnswering || isPending) {
      return;
    }
    if (!isOpenForAnswer) {
      handleFalseStart();
      return;
    }
    if (canAnswer && sendAnswerQuestion()) {
      playSound("tap");
      setIsPending(true);
      clearTimeout(pendingTimeout.current);
      // Safety net – the server always answers with a new state
      pendingTimeout.current = setTimeout(() => setIsPending(false), 3000);
    }
  };

  const handleFalseStart = () => {
    playSound("falseStart");
    setIsFalseStart(true);
    clearTimeout(falseStartTimeout.current);
    falseStartTimeout.current = setTimeout(
      () => setIsFalseStart(false),
      FALSE_START_PENALTY * 1000
    );
  };

  // Every state from the server resolves the pending buzz
  useEffect(() => {
    setIsPending(false);
    clearTimeout(pendingTimeout.current);
  }, [stateVersion]);

  // Countdown while answering
  useEffect(() => {
    if (!isAnswering) {
      setTimeToAnswer(null);
      return;
    }
    setIsFalseStart(false);
    setTimeToAnswer(TIME_TO_ANSWER);
    const intervalId = setInterval(() => {
      setTimeToAnswer((currentValue) =>
        currentValue === null || currentValue <= 0 ? 0 : currentValue - 1
      );
    }, 1000);
    return () => clearInterval(intervalId);
  }, [isAnswering]);

  // The clock gets loud for the last seconds
  useEffect(() => {
    if (timeToAnswer !== null && timeToAnswer > 0 && timeToAnswer <= 5) {
      playSound("tickUrgent");
    }
  }, [timeToAnswer]);

  useEffect(
    () => () => {
      clearTimeout(falseStartTimeout.current);
      clearTimeout(pendingTimeout.current);
    },
    []
  );

  return (
    <div className="stage gameContainer">
      <Scenery mood={canAnswer ? "open" : isFalseStart ? "wrong" : "night"} flakes={22} />
      <div className="score">
        <span className="eyebrow">Twój wynik</span>
        <span className="scoreValue display" key={score}>
          {score}
          <FontAwesomeIcon className="gift gameCurrency" icon={faGift} />
        </span>
      </div>
      <div className="answerButtonWrap">
        <div
          className={`
        answerButton 
        ${isAnswering ? "isAnswering" : ""} 
        ${isOpenForAnswer ? "" : "blockedButton"} 
        ${isFalseStart ? "falseStart" : ""}`}
          onClick={handleAnswer}
        >
          {isAnswering && (
            <svg className="answerRing" viewBox="0 0 120 120" aria-hidden>
              <circle cx="60" cy="60" r="56" />
            </svg>
          )}
          <div className="answerButtonLabel">
            {isAnswering && (
              <div className="timeToAnswer display" key={timeToAnswer}>
                {timeToAnswer}
              </div>
            )}
            {isFalseStart && "FALSTART"}
            {isPending && !isFalseStart && "…"}
            {canAnswer && "ODPOWIEDZ"}
            {isWaiting && "CZEKAJ"}
          </div>
        </div>
      </div>
    </div>
  );
};
