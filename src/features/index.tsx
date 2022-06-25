import { useTicTacToeActor } from "src/modules/ticTacToe.context";
import { default as Landing } from "./Landing";
import { default as Game } from "./Game";

export const MainContent = () => {
  const [ticTacToeState] = useTicTacToeActor();
  return ticTacToeState.matches("idle") ? <Landing /> : <Game />;
};
