import { useContext, useState } from "react";
import { Input, Button } from "@chakra-ui/react";

import { AppContext } from "../services/SocketProvider";

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
  } = useContext(AppContext);

  const [betAmount, setBetAmount] = useState("");
  const [isBetAmountTouched, setIsBetAmountTouched] = useState(false);
  const [isBetAmountSent, setIsBetAmountSent] = useState(false);
  const [isBetAmountValid, setIsBetAmountValid] =
    useState<boolean | undefined>();
  const [answer, setAnswer] = useState("");
  const [isAnswerSent, setIsAnswerSent] = useState(false);

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
    const parsedBet = parseInt(betAmount);
    sendBetAmount(parsedBet);
    setIsBetAmountSent(true);
  };

  const handleAnswerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAnswer(event.currentTarget.value);
  };
  const handleAnswerSubmit = () => {
    sendFinalQuestionAnswer(answer);
    setIsAnswerSent(true);
  };
  const getBackgroundColor = () => {
    switch (isFinalQuestionAnswerCorrect) {
      case true:
        return "#459e4b";
      case false:
        return "#c43a3a";
      default:
        return "#eff9ff";
    }
  };

  const getColor = () => {
    switch (isFinalQuestionAnswerCorrect) {
      case true:
        return "#eff9ff";
      case false:
        return "#eff9ff";
      default:
        return "#222222";
    }
  };

  return (
    <div
      className="finalQuestionContainer"
      style={{ backgroundColor: getBackgroundColor(), color: getColor() }}
    >
      <div className="finalQuestionHeaders">
        <div className="finalQuestionHeader">Fina??owe Pytanie</div>
        <div className="finalQuestionScore">
          Twoje punkty: {score}{" "}
          <FontAwesomeIcon className="gameCurrency" icon={faGift} />
        </div>
      </div>

      {isBetting && (
        <div className="bettingContainer">
          <Input
            placeholder="Podaj ile punkt??w chcesz obstawi??"
            className="betAmountInput"
            colorScheme="primary"
            disabled={isBetAmountSent}
            value={betAmount}
            onChange={handleBetAmountChange}
          />
          {!isBetAmountValid && isBetAmountTouched && (
            <div className="betAmountError">B????dna ilo????</div>
          )}
          <Button
            colorScheme="primary"
            className="sendFinalQuestionBetButton"
            size="lg"
            onClick={handleBetAmountSubmit}
            isDisabled={!isBetAmountValid || isBetAmountSent}
          >
            Zatwierd??
          </Button>
          {isBetAmountSent && (
            <div className="finalQuestionConfirmMessage">Wys??ano :)</div>
          )}
        </div>
      )}

      {isAnsweringFinalQuestion && (
        <div className="answerContainer">
          <Input
            placeholder="Podaj odpowied??"
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
            isDisabled={!isBetAmountValid || isAnswerSent || runOutOfTime}
          >
            Zatwierd??
          </Button>
          {isAnswerSent && (
            <div className="finalQuestionConfirmMessage">Wys??ano :)</div>
          )}
          {runOutOfTime && !isAnswerSent && (
            <div className="finalQuestionOutOfTimeMessage">
              Niestety koniec czasu :/
            </div>
          )}
        </div>
      )}
    </div>
  );
};
