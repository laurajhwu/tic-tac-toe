import { initalBoard } from "src/constants/board";
import ticTacToeMachine from "src/modules/ticTacToe.machine";
import { Player } from "src/types/player";
import { interpret } from "xstate";
//pnpm test -- ticTacToePlayer.test.ts

describe("board reset", () => {
  /**this default config is to bypass conditions/actions
     that are not related to testing wins */
  const defaultConfig = {
    guards: { hasPersistedGame: () => true },
    actions: {
      persistGame: () => {},
      setCurrentGame: () => {},
    },
  };

  it("should clear board when reset is pressed at game end", (done) => {
    const finishedBoard = [
      [Player.x, Player.o, Player.x],
      [Player.o, Player.x, Player.o],
      [Player.o, Player.x, ""],
    ];

    const service = interpret(
      ticTacToeMachine.withConfig(defaultConfig, {
        board: finishedBoard,
        currentPlayer: Player.o,
        totalNumOfMoves: 7,
      })
    );

    service.onTransition((state) => {
      if (state.matches("idle")) {
        expect(state.context.board).toEqual(initalBoard);
        done();
      }
    });

    service.start({ playing: "checkMoveResult" });

    service.send({ type: "RESET_GAME" });
  });

  it("should clear board when reset is pressed even during a game", (done) => {
    const finishedBoard = [
      ["", Player.o, Player.x],
      [Player.o, Player.x, Player.o],
      [Player.o, Player.x, ""],
    ];

    const service = interpret(
      ticTacToeMachine.withConfig(defaultConfig, {
        board: finishedBoard,
        currentPlayer: Player.x,
        totalNumOfMoves: 7,
      })
    );

    service.onTransition((state) => {
      if (state.matches("idle")) {
        expect(state.context.board).toEqual(initalBoard);
        done();
      }
    });

    service.start();

    service.send({ type: "MOVE", row: 0, column: 0 });

    service.send({ type: "RESET_GAME" });
  });
});
