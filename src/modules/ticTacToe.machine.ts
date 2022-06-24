import { assign, createMachine, send } from "xstate";
import { Player } from "src/types/player";
import { Board } from "src/types/board";
import { WinType } from "src/types/game";
import { initalBoard } from "src/constants/board";
import { localStorageKeys } from "src/constants/localStorage";
import { deepCopyBoard } from "src/utils";

interface TicTacToeMachineContext {
  board: Board;
  currentPlayer: Player;
  beginningWinIndex?: number;
  totalNumOfMoves: number;
}

type MoveEvent = { type: "MOVE"; row: number; column: number };
type StartGameEvent = { type: "START_GAME" };
type CheckResultCompleteEvent = {
  type: "CHECK_RESULT_COMPLETE";
  winType?: WinType;
  beginningWinIndex?: number;
};
type ResetGameEvent = { type: "RESET_GAME" };
type TicTacToeMachineEvent =
  | MoveEvent
  | StartGameEvent
  | CheckResultCompleteEvent
  | ResetGameEvent;

const ticTacToeMachine = createMachine(
  {
    schema: {
      context: {} as TicTacToeMachineContext,
      events: {} as TicTacToeMachineEvent,
    },
    tsTypes: {} as import("./ticTacToe.machine.typegen").Typegen0,
    id: "ticTacToe",
    initial: "checkPersistedGame",
    context: {
      board: deepCopyBoard(initalBoard.map((column) => [...column])),
      currentPlayer: Player.x,
      totalNumOfMoves: 0,
    },
    on: {
      RESET_GAME: {
        actions: "resetContext",
        target: "idle",
      },
    },
    states: {
      checkPersistedGame: {
        always: [
          {
            cond: "hasPersistedGame",
            target: "playing",
          },
          { target: "idle" },
        ],
      },

      idle: {
        on: {
          START_GAME: "playing",
        },
      },
      playing: {
        initial: "checkPlayer",
        states: {
          checkPlayer: {
            always: [
              {
                cond: "isPlayerX",
                target: "#ticTacToe.playing.xPlaying",
              },
              {
                target: "#ticTacToe.playing.circlePlaying",
              },
            ],
          },
          xPlaying: {
            on: {
              MOVE: {
                cond: "isEmptySlot",
                actions: ["setXOnBoard", "setCurrentPlayerX", "persistGame"],
                target: "#ticTacToe.playing.checkMoveResult",
              },
            },
          },
          circlePlaying: {
            on: {
              MOVE: {
                cond: "isEmptySlot",
                actions: [
                  "setCircleOnBoard",
                  "setCurrentPlayerCircle",
                  "persistGame",
                ],
                target: "#ticTacToe.playing.checkMoveResult",
              },
            },
          },
          checkMoveResult: {
            entry: "addMoveCount",
            invoke: {
              src: "checkingResult",
            },
            on: {
              CHECK_RESULT_COMPLETE: [
                {
                  cond: "isHorizontalWin",
                  target: "#ticTacToe.gameEnd.win.horitzontalWin",
                  actions: "setBeginningWinIndex",
                },
                {
                  cond: "isVerticalWin",
                  target: "#ticTacToe.gameEnd.win.verticalWin",
                  actions: "setBeginningWinIndex",
                },
                {
                  cond: "isDiagonalWin",
                  target: "#ticTacToe.gameEnd.win.diagonalWin",
                  actions: "setBeginningWinIndex",
                },
                {
                  cond: "isDraw",
                  target: "#ticTacToe.gameEnd.draw",
                },
                {
                  cond: "isPlayerX",
                  target: "#ticTacToe.playing.circlePlaying",
                },
                {
                  target: "#ticTacToe.playing.xPlaying",
                },
              ],
            },
          },
        },
      },
      gameEnd: {
        states: {
          win: {
            states: {
              horitzontalWin: { type: "final" },
              verticalWin: { type: "final" },
              diagonalWin: { type: "final" },
            },
          },
          draw: { type: "final" },
        },
      },
    },
  },
  {
    guards: {
      hasPersistedGame: (_) =>
        !!localStorage.getItem(localStorageKeys.currentBoard),
      isEmptySlot: (context, event) => !context.board[event.row][event.column],
      isHorizontalWin: (_, event) => event.winType === WinType.HoritzontalWin,
      isVerticalWin: (_, event) => event.winType === WinType.VerticalWin,
      isDiagonalWin: (_, event) =>
        event.winType === WinType.TopLeftdiagonalWin ||
        event.winType === WinType.TopRightdiagonalWin,
      isDraw: (context) =>
        context.totalNumOfMoves ===
        context.board.length * context.board[0].length - 1,
      isPlayerX: (context) => context.currentPlayer === Player.x,
    },
    actions: {
      setXOnBoard: assign({
        board: (context, event) => {
          const copyOfBoard = [...context.board];
          const copyOfColumn = [...context.board[event.row]];
          copyOfColumn[event.column] = Player.x;
          copyOfBoard[event.row] = copyOfColumn;

          return copyOfBoard;
        },
      }),
      setCircleOnBoard: assign({
        board: (context, event) => {
          const copyOfBoard = [...context.board];
          const copyOfColumn = [...context.board[event.row]];
          copyOfColumn[event.column] = Player.o;
          copyOfBoard[event.row] = copyOfColumn;

          return copyOfBoard;
        },
      }),
      setCurrentPlayerX: assign({
        currentPlayer: (_) => Player.x,
      }),
      setCurrentPlayerCircle: assign({
        currentPlayer: (_) => Player.o,
      }),
      persistGame: (context) => {
        localStorage.setItem(
          localStorageKeys.currentBoard,
          JSON.stringify(context.board)
        );
      },
      resetContext: assign((_) => ({
        board: deepCopyBoard(initalBoard),
        currentPlayer: Player.x,
        beginningWinIndex: undefined,
      })),
      setBeginningWinIndex: assign({
        beginningWinIndex: (_, event) => event.beginningWinIndex,
      }),
      addMoveCount: assign({
        totalNumOfMoves: (context) => context.totalNumOfMoves + 1,
      }),
    },
    services: {
      checkingResult: (context) => (send) => {
        const result: Pick<TicTacToeMachineContext, "beginningWinIndex"> & {
          winType?: WinType;
        } = { winType: undefined, beginningWinIndex: undefined };

        const isHorizontalWin = (): boolean => {
          return context.board.some((column, index) => {
            result.beginningWinIndex = index;
            return column.every((symbol) => symbol === context.currentPlayer);
          });
        };

        const isVerticalWin = (): boolean => {
          return context.board[0].some((_, index) => {
            result.beginningWinIndex = index;
            return context.board.every(
              (column) => column[index] === context.currentPlayer
            );
          });
        };

        const diagonalWinResult = (): WinType | undefined => {
          const shallowCopyBoard = [...context.board];
          const isTopLeftDiagonalWin = () =>
            context.board.every((column, index) => {
              if (index === 0) {
                result.beginningWinIndex = 0;
              }
              return column[index] === context.currentPlayer;
            });
          const isTopRightDiagonalWin = () => {
            const lastIndexOfRow = shallowCopyBoard.length - 1;

            return shallowCopyBoard.every((column, index) => {
              if (index === 0) {
                result.beginningWinIndex = lastIndexOfRow - index;
              }
              return column[lastIndexOfRow - index] === context.currentPlayer;
            });
          };

          if (isTopLeftDiagonalWin()) {
            return WinType.TopLeftdiagonalWin;
          } else if (isTopRightDiagonalWin()) {
            return WinType.TopRightdiagonalWin;
          }
          return undefined;
        };

        if (isHorizontalWin()) {
          result.winType = WinType.HoritzontalWin;
        } else if (isVerticalWin()) {
          result.winType = WinType.VerticalWin;
        } else {
          const diagonalResult = diagonalWinResult();

          if (diagonalResult) {
            result.winType = diagonalResult;
          } else {
            result.beginningWinIndex = undefined;
          }
        }

        send({ type: "CHECK_RESULT_COMPLETE", ...result });
      },
    },
  }
);

export default ticTacToeMachine;
