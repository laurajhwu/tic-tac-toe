import { assign, createMachine, send } from "xstate";
import { Player } from "src/types/player";
import { Board, WinType } from "src/types/board";
import { initalBoard } from "src/constants/board";
import { localStorageKeys } from "src/constants/localStorage";

interface TicTacToeMachineContext {
  board: Board;
  currentPlayer: Player;
  beginningWinIndex?: number;
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
      board: initalBoard,
      currentPlayer: Player.x,
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
        initial: "xPlaying",
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
            entry: "checkingResult",
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
                  cond: "isTie",
                  target: "#ticTacToe.gameEnd.tie",
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
          tie: { type: "final" },
        },
      },
    },
  },
  {
    guards: {
      hasPersistedGame: (_) =>
        !!localStorage.getItem(localStorageKeys.currentBoard),
      isEmptySlot: (context, event) => !context.board[event.row][event.column],
      isHorizontalWin: (_, event) => event.winType === WinType.horitzontalWin,
      isVerticalWin: (_, event) => event.winType === WinType.verticalWin,
      isDiagonalWin: (_, event) => event.winType === WinType.diagonalWin,
      isTie: (context) =>
        context.board.every((column) => column.every((space) => !!space)),
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
        board: initalBoard,
        currentPlayer: Player.x,
        beginningWinIndex: undefined,
      })),
      checkingResult: send((context) => {
        const result: Pick<TicTacToeMachineContext, "beginningWinIndex"> & {
          wintype?: WinType;
        } = { wintype: undefined, beginningWinIndex: undefined };

        const isHorizontalWin = () => {
          return context.board.some((column, index) => {
            result.beginningWinIndex = index;
            return column.every((symbol) => symbol === context.currentPlayer);
          });
        };

        const isVerticalWin = () => {
          return context.board[0].some((_, index) => {
            result.beginningWinIndex = index;
            return context.board.every(
              (column) => column[index] === context.currentPlayer
            );
          });
        };

        const isDiagonalWin = () => {
          const shallowCopyBoard = [...context.board];
          const isLeftTopDiagonalWin = context.board.every((column, index) => {
            result.beginningWinIndex = 0;
            return column[index] === context.currentPlayer;
          });
          const isRightTopDiagonalWin = shallowCopyBoard
            .reverse()
            .every((column, index) => {
              result.beginningWinIndex = context.board[0].length - 1;
              column[index] === context.currentPlayer;
            });
          return isLeftTopDiagonalWin || isRightTopDiagonalWin;
        };

        if (isHorizontalWin()) {
          result.wintype = WinType.horitzontalWin;
        } else if (isVerticalWin()) {
          result.wintype = WinType.verticalWin;
        } else if (isDiagonalWin()) {
          result.wintype = WinType.diagonalWin;
        } else {
          result.beginningWinIndex = undefined;
        }

        return { type: "CHECK_RESULT_COMPLETE", ...result };
      }),
      setBeginningWinIndex: assign({
        beginningWinIndex: (_, event) => event.beginningWinIndex,
      }),
    },
  }
);

export default ticTacToeMachine;
