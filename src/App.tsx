import { ChakraProvider } from "@chakra-ui/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";

import { SocketProvider } from "./services/SocketProvider";
import { JoinGame } from "./pages/JoinGame";
import { WaitingForGameStart } from "./pages/WaitingForGameStart";
import { Game } from "./pages/Game";

function App() {
  return (
    <BrowserRouter>
      <SocketProvider>
        <ChakraProvider>
          <Routes>
            <Route path="/" element={<JoinGame />} />
            <Route path="/lobby" element={<WaitingForGameStart />} />
            <Route path="/game" element={<Game />} />
          </Routes>
        </ChakraProvider>
      </SocketProvider>
    </BrowserRouter>
  );
}

export default App;
