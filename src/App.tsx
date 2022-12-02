import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Route } from "react-router-dom";
import { useEffect } from "react";

import { SocketProvider } from "./services/SocketProvider";
import { JoinGame } from "./pages/JoinGame";
import { WaitingForGameStart } from "./pages/WaitingForGameStart";
import { Game } from "./pages/Game";
import { GameWinner } from "./pages/resultPages/GameWinner";
import { Loser } from "./pages/resultPages/Loser";
import { TournamentWinner } from "./pages/resultPages/TournamentWinner";
import { FinalQuestion } from "./pages/FinalQuestion";

import theme from "./theme";
import "./App.css";

function App() {
  useEffect(() => {
    window.onbeforeunload = function (e) {
      e = e || window.event;
      return "Sure?";
    };
  }, []);

  return (
    <BrowserRouter>
      <SocketProvider>
        <ChakraProvider theme={theme}>
          <Route exact path="/">
            <JoinGame />
          </Route>
          <Route exact path="/lobby">
            <WaitingForGameStart />
          </Route>
          <Route exact path="/game">
            <Game />
          </Route>
          <Route exact path="/finalQuestion">
            <FinalQuestion />
          </Route>
          <Route path="/gameWinner">
            <GameWinner />
          </Route>
          <Route exact path="/loser">
            <Loser />
          </Route>
          <Route exact path="/tournamentWinner">
            <TournamentWinner />
          </Route>
        </ChakraProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
