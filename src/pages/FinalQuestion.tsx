import { useContext, useEffect, useState } from "react";
import { Input, Button } from "@chakra-ui/react";

import { AppContext } from "../services/SocketProvider";

import { Scenery } from "../festive/Scenery";
import { Sparkle } from "../festive/Decor";

import "./finalQuestion.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGift } from "@fortawesome/free-solid-svg-icons";

export const FinalQuestion = () => {
  const {
    isBetting,
    isAnsweringFinalQuestion,
    score,
    sendBetAmount,
    sendFinalQuestionAnswer,
    isFinalQuestionAnswerCorrect,
    runOutOfTime,
    hasBet,
    betAmount: confirmedBetAmount,
    hasAnswered,
    submittedAnswer,
  } = useContext(AppContext);

  // After a reload the server tells what was already sent
  const [betAmount, setBetAmount] = useState(
    confirmedBetAmount !== null ? String(confirmedBetAmount) : ""
  );
  const [isBetAmountTouched, setIsBetAmountTouched] = useState(false);
  const [isBetAmountSentLocally, setIsBetAmountSent] = useState(false);
  const [isBetAmountValid, setIsBetAmountValid] =
    useState<boolean | undefined>();
  const [answer, setAnswer] = useState(submittedAnswer ?? "");
  const [isAnswerSentLocally, setIsAnswerSent] = useState(false);
  const isBetAmountSent = hasBet || isBetAmountSentLocally;
  const isAnswerSent = hasAnswered || isAnswerSentLocally;

  useEffect(() => {
    if (confirmedBetAmount !== null) {
      setBetAmount(String(confirmedBetAmount));
    }
  }, [confirmedBetAmount]);

  const handleBetAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const rawValue = event.currentTarget.value;
    const parsedBet = parseInt(rawValue);
    const isValid =
      score < 0
        ? parsedBet === 0
        : !Number.isNaN(parsedBet) && parsedBet >= 0 && parsedBet <= score;

    setIsBetAmountValid(isValid);

    setBetAmount(rawValue);
    setIsBetAmountTouched(true);
  };
  const handleBetAmountSubmit = () => {
    if (!isBetAmountValid || isBetAmountSent) return;
    const parsedBet = parseInt(betAmount);
    sendBetAmount(parsedBet);
    setIsBetAmountSent(true);
  };

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.currentTarget.value);
  };
  const handleAnswerSubmit = () => {
    if (isAnswerSent || runOutOfTime) return;
    sendFinalQuestionAnswer(answer);
    setIsAnswerSent(true);
  };
  const mood =
    isFinalQuestionAnswerCorrect === true
      ? "open"
      : isFinalQuestionAnswerCorrect === false
      ? "wrong"
      : "night";

  return (
    <div className="stage finalQuestionContainer">
      <Scenery mood={mood} flakes={22} />
      <div className="stageContent finalQuestionContent">
      <div className="finalQuestionHeaders">
        <Sparkle className="finalQuestionStar" />
        <div className="finalQuestionHeader display goldText">
          Finałowe Pytanie
        </div>
        <div className="finalQuestionScore">
          Twoje punkty: <b>{score}</b>
          <FontAwesomeIcon className="gift gameCurrency" icon={faGift} />
        </div>
      </div>

      {isFinalQuestionAnswerCorrect !== undefined && (
        <div className="finalQuestionVerdict display">
          {isFinalQuestionAnswerCorrect ? "Dobra odpowiedź!" : "Zła odpowiedź"}
        </div>
      )}

      {isBetting && (
        <div className="bettingContainer">
          <Input
            placeholder="Podaj ile punktów chcesz obstawić"
            className="betAmountInput"
            colorScheme="primary"
            disabled={isBetAmountSent}
            value={betAmount}
            onChange={handleBetAmountChange}
          />
          {!isBetAmountValid && isBetAmountTouched && (
            <div className="betAmountError">Błędna ilość</div>
          )}
          <Button
            colorScheme="primary"
            className="sendFinalQuestionBetButton"
            size="lg"
            onClick={handleBetAmountSubmit}
            isDisabled={!isBetAmountValid || isBetAmountSent}
          >
            Zatwierdź
          </Button>
          {isBetAmountSent && (
            <div className="finalQuestionConfirmMessage">Wysłano :)</div>
          )}
        </div>
      )}

      {isAnsweringFinalQuestion && (
        <div className="answerContainer">
          <Input
            placeholder="Podaj odpowiedź"
            className="answerInput"
            disabled={isAnswerSent || runOutOfTime}
            value={answer}
            onChange={handleAnswerChange}
          />
          <Button
            className="sendFinalQuestionAnswerButton"
            colorScheme="primary"
            size="lg"
            onClick={handleAnswerSubmit}
            isDisabled={isAnswerSent || runOutOfTime}
          >
            Zatwierdź
          </Button>
          {isAnswerSent && (
            <div className="finalQuestionConfirmMessage">Wysłano :)</div>
          )}
          {runOutOfTime && !isAnswerSent && (
            <div className="finalQuestionOutOfTimeMessage">
              Niestety koniec czasu :/
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
};
