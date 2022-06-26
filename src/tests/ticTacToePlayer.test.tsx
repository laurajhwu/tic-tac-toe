import { initalBoard } from "src/constants/board";
import ticTacToeMachine from "src/modules/ticTacToe.machine";
import { Player } from "src/types/player";
import { deepCopyBoard } from "src/utils";
import { interpret } from "xstate";
import { screen, render } from "@testing-library/react";
import Game from "src/features/Game";
import userEvent from "@testing-library/user-event";
import { TicTacToeProvider } from "src/modules/ticTacToe.context";
//pnpm test -- ticTacToePlayer.test.ts

describe("test turns", () => {
  const board = deepCopyBoard(initalBoard);

  const machine = ticTacToeMachine.withConfig(
    {
      /**this default config is to bypass conditions/actions
     that are not related to testing wins */
      guards: { hasPersistedGame: () => true },
      actions: {
        persistGame: () => {},
        setCurrentGame: () => {},
      },
    },
    {
      currentPlayer: Player.x,
      board,
      totalNumOfMoves: 0,
    }
  );

  it("should be PlayCircle's turn after PlayerX has moved", (done) => {
    const service = interpret(machine);

    service.onTransition((state) => {
      if (state.matches({ playing: "circlePlaying" })) {
        done();
      }
    });

    service.start();

    service.send({ type: "MOVE", row: 0, column: 0 });
  });

  it("should be PlayerX's turn after PlayCircle has moved", (done) => {
    const service = interpret(machine);

    service.onTransition((state) => {
      if (state.matches({ playing: "xPlaying" })) {
        done();
      }
    });

    service.start();

    service.send({ type: "MOVE", row: 1, column: 1 });
  });
});

describe("test ui", () => {
  it("should display 'x' when player clicks empty space on the board", () => {
    render(
      <TicTacToeProvider>
        <Game />
      </TicTacToeProvider>
    );

    userEvent.click(screen.getAllByTestId("boardSpace")[0]).then(() => {
      expect(screen.getAllByTestId("boardSpace")[0].innerText).toBe("x");
    });
  });
});
