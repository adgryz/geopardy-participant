import { faGift } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useContext, useState, useEffect } from "react";

import { AppContext } from "../services/SocketProvider";

import "./game.css";

const TIME_TO_ANSWER = 20;
const FALSE_START_PENALTY = 2;

export const Game = () => {
  const { score, isOpenForAnswer, sendAnswerQuestion } = useContext(AppContext);
  const [timeToAnswer, setTimeToAnswer] = useState<number | null>(null);
  const [isFalseStart, setIsFalseStart] = useState(false);
  const [timeCounterIntervalId, setTimeCounterIntervalId] =
    useState<NodeJS.Timer>();

  const isAnswering = timeToAnswer !== null;
  const canAnswer = !isAnswering && !isFalseStart && isOpenForAnswer;
  const isWaiting = !isAnswering && !isFalseStart && !isOpenForAnswer;

  const handleAnswer = () => {
    if (isAnswering) {
      return;
    }
    handleFalseStart();
    if (canAnswer) {
      sendAnswerQuestion();
      handleTimeLeftToAnswer();
    }
  };

  const handleFalseStart = () => {
    if (!isOpenForAnswer) {
      setIsFalseStart(true);
      setTimeout(() => setIsFalseStart(false), FALSE_START_PENALTY * 1000);
    }
  };

  const handleTimeLeftToAnswer = () => {
    setTimeToAnswer(TIME_TO_ANSWER);
    const intervalId = setInterval(() => {
      setTimeToAnswer((currentValue) =>
        currentValue === null ? TIME_TO_ANSWER : currentValue - 1
      );
    }, 1000);
    setTimeCounterIntervalId(intervalId);
  };

  useEffect(() => {
    if (timeToAnswer === 0) {
      clearInterval(timeCounterIntervalId);
    }
  }, [timeToAnswer, timeCounterIntervalId]);

  useEffect(() => {
    clearInterval(timeCounterIntervalId);
    setIsFalseStart(false);
    setTimeToAnswer(null);
  }, [score]);

  return (
    <div className="gameContainer">
      <div className="score">
        Twój wynik: {score}{" "}
        <FontAwesomeIcon className="gameCurrency" icon={faGift} />
      </div>
      <div
        className={`
        answerButton 
        ${isAnswering ? "isAnswering" : ""} 
        ${isOpenForAnswer ? "" : "blockedButton"} 
        ${isFalseStart ? "falseStart" : ""}`}
        onClick={handleAnswer}
      >
        <div>
          {isAnswering && <div className="timeToAnswer">{timeToAnswer} s</div>}
          {isFalseStart && "FALSE START"}
          {canAnswer && "ODPOWIEDZ"}
          {isWaiting && "CZEKAJ"}
        </div>
      </div>
    </div>
  );
};
