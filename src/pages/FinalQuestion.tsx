import { useContext, useState } from "react";
import { Input, Button } from "@chakra-ui/react";

import { AppContext } from "../services/SocketProvider";

import "./finalQuestion.css";

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
      !Number.isNaN(parsedBet) && parsedBet >= 0 && parsedBet <= score;
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
        return "#afe4c8";
      case false:
        return "ff9d92";
      default:
        return "blue";
    }
  };

  return (
    <div
      className="finalQuestionContainer"
      style={{ backgroundColor: getBackgroundColor() }}
    >
      <div className="finalQuestionHeaders">
        <div className="finalQuestionHeader">Finałowe Pytanie</div>
        <div className="finalQuestionScore">Twoje punkty: {score}</div>
      </div>

      {isBetting && (
        <div className="bettingContainer">
          <Input
            placeholder="Podaj ile punktów chcesz obstawić"
            className="betAmountInput"
            disabled={isBetAmountSent}
            value={betAmount}
            onChange={handleBetAmountChange}
          />
          {!isBetAmountValid && isBetAmountTouched && (
            <div className="betAmountError">Błędna ilość</div>
          )}
          <Button
            colorScheme="teal"
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
            colorScheme="teal"
            size="lg"
            onClick={handleAnswerSubmit}
            isDisabled={!isBetAmountValid || isAnswerSent || runOutOfTime}
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
  );
};
