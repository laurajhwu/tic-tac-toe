import { interpret } from "xstate";
import { initalBoard } from "../constants/board";
import ticTacToeMachine from "../modules/ticTacToe.machine";
import { Player } from "../types/player";
//pnpm test -- ticTacToeResults.test.ts

describe("test wins", () => {
  /**this default config is to bypass conditions/actions
     that are not related to testing wins */
  const defaultConfig = {
    guards: { hasPersistedGame: () => true },
    actions: {
      persistGame: () => {},
      setCurrentGame: () => {},
    },
  };

  it("should be horizontal win and beginningWinIndex of 0 after PlayerX moves to (0,0) with a board of (0,1) and (0,2) containing 'x'", (done) => {
    const board = initalBoard.map((column) => [...column]);
    board[0] = ["", Player.x, Player.x];

    const service = interpret(
      ticTacToeMachine.withConfig(defaultConfig, {
        board,
        currentPlayer: Player.x,
        totalNumOfMoves: 2,
      })
    ).onTransition((state) => {
      if (state.matches({ gameEnd: "win" })) {
        expect(state.context.wins?.horitzontalWin).toEqual([
          "(0,0)",
          "(0,1)",
          "(0,2)",
        ]);
        done();
      }
    });

    service.start({ playing: "xPlaying" });

    service.send({ type: "MOVE", row: 0, column: 0 });
  });

  it("should be vertical win and beginningWinIndex of 1 after PlayerX moves to (1,1) with a board of (0,1) and (2,1) containing 'x'", (done) => {
    const board = [
      [Player.o, Player.x, ""],
      ["", "", ""],
      ["", Player.x, Player.o],
    ];

    const service = interpret(
      ticTacToeMachine.withConfig(defaultConfig, {
        board,
        currentPlayer: Player.x,
        totalNumOfMoves: 4,
      })
    ).onTransition((state) => {
      if (state.matches({ gameEnd: "win" })) {
        expect(state.context.wins?.verticalWin).toEqual([
          "(0,1)",
          "(1,1)",
          "(2,1)",
        ]);
        done();
      }
    });

    service.start({ playing: "xPlaying" });

    service.send({ type: "MOVE", row: 1, column: 1 });
  });

  it("should be top left diagonal win and beginningWinIndex of 0 after PlayerX moves to (2,2) with a board of (0,0) and (1,1) containing 'x'", (done) => {
    const board = [
      [Player.x, Player.o, ""],
      [Player.o, Player.x, ""],
      ["", "", ""],
    ];

    const service = interpret(
      ticTacToeMachine.withConfig(defaultConfig, {
        board,
        currentPlayer: Player.x,
        totalNumOfMoves: 4,
      })
    ).onTransition((state) => {
      if (state.matches({ gameEnd: "win" })) {
        expect(state.context.wins?.topLeftdiagonalWin).toEqual([
          "(0,0)",
          "(1,1)",
          "(2,2)",
        ]);
        done();
      }
    });

    service.start({ playing: "xPlaying" });

    service.send({ type: "MOVE", row: 2, column: 2 });
  });

  it("should be top right diagonal win and beginningWinIndex of 2 after PlayerX moves to (2,0) with a board of (0,2) and (1,1) containing 'x'", (done) => {
    const board = [
      [Player.o, Player.o, Player.x],
      [Player.o, Player.x, ""],
      ["", "", Player.o],
    ];

    const service = interpret(
      ticTacToeMachine.withConfig(defaultConfig, {
        board,
        currentPlayer: Player.x,
        totalNumOfMoves: 6,
      })
    ).onTransition((state) => {
      if (state.matches({ gameEnd: "win" })) {
        expect(state.context.wins?.topRightdiagonalWin).toEqual([
          "(0,2)",
          "(1,1)",
          "(2,0)",
        ]);
        done();
      }
    });

    service.start({ playing: "xPlaying" });

    service.send({ type: "MOVE", row: 2, column: 0 });
  });
});

describe("test draw", () => {
  /**this default config is to bypass conditions/actions
     that are not related to testing wins */
  const defaultConfig = {
    guards: { hasPersistedGame: () => true },
    actions: {
      persistGame: () => {},
      setCurrentGame: () => {},
    },
  };

  it("should return final state of 'gameEnd.draw' when PlayerX makes the last total Move", (done) => {
    const board = [
      ["", Player.o, Player.x],
      [Player.x, Player.x, Player.o],
      [Player.o, Player.x, Player.o],
    ];

    const service = interpret(
      ticTacToeMachine.withConfig(defaultConfig, {
        board,
        currentPlayer: Player.x,
        totalNumOfMoves: 8,
      })
    ).onTransition((state) => {
      if (state.matches({ gameEnd: "draw" })) {
        done();
      }
    });

    service.start({ playing: "xPlaying" });

    service.send({ type: "MOVE", row: 0, column: 0 });
  });
});
