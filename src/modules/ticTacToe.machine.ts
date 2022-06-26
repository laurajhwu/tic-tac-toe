import { assign, createMachine, send } from "xstate";
import { Player, Mode } from "src/types/player";
import { Board } from "src/types/board";
import { WinType } from "src/types/game";
import { initalBoard } from "src/constants/board";
import { localStorageKeys } from "src/constants/localStorage";
import { deepCopyBoard } from "src/utils";

interface TicTacToeMachineContext {
  board: Board;
  currentPlayer: Player;
  //['(rowIndex)','(columnIndex)']
  winningIndicies?: string[];
  totalNumOfMoves: number;
  playerMode?: Mode;
}

type MoveEvent = { type: "MOVE"; row: number; column: number };
type StartGameEvent = { type: "START_GAME" };
type CheckResultCompleteEvent = {
  type: "CHECK_RESULT_COMPLETE";
  winType?: WinType;
  winningIndicies?: string[];
};
type ResetGameEvent = { type: "RESET_GAME" };
type SelectPlayerModeEvent = { type: "SELECT_PLAYER_MODE"; playerMode: Mode };
type TicTacToeMachineEvent =
  | MoveEvent
  | StartGameEvent
  | CheckResultCompleteEvent
  | ResetGameEvent
  | SelectPlayerModeEvent;

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
        actions: ["resetContext", "clearPersistedGame"],
        target: "idle",
      },
    },
    states: {
      checkPersistedGame: {
        always: [
          {
            cond: "hasPersistedGame",
            target: "#ticTacToe.playing.checkMoveResult",
            actions: "setCurrentGame",
          },
          { target: "idle" },
        ],
      },
      idle: {
        on: {
          START_GAME: "playing",
          SELECT_PLAYER_MODE: { actions: "setPlayerMode" },
        },
      },
      playing: {
        initial: "xPlaying",
        states: {
          xPlaying: {
            on: {
              MOVE: {
                cond: "isEmptySlot",
                actions: [
                  "setXOnBoard",
                  "setCurrentPlayerX",
                  "persistGame",
                  "addMoveCount",
                ],
                target: "#ticTacToe.playing.checkMoveResult",
              },
            },
          },
          circlePlaying: {
            initial: "checkPlayerMode",
            states: {
              checkPlayerMode: {
                always: [
                  {
                    cond: "isPvC",
                    target: "#ticTacToe.playing.circlePlaying.modePvC",
                  },
                  { target: "#ticTacToe.playing.circlePlaying.idle" },
                ],
              },
              idle: {
                on: {
                  MOVE: {
                    cond: "isEmptySlot",
                    actions: [
                      "setCircleOnBoard",
                      "setCurrentPlayerCircle",
                      "persistGame",
                      "addMoveCount",
                    ],
                    target: "#ticTacToe.playing.checkMoveResult",
                  },
                },
              },
              modePvC: {
                after: {
                  PC_DELAY: {
                    actions: [
                      "setCurrentPlayerCircle",
                      "makeRandomMove",
                      "persistGame",
                      "addMoveCount",
                    ],
                    target: "#ticTacToe.playing.checkMoveResult",
                  },
                },
              },
            },
          },
          checkMoveResult: {
            invoke: {
              src: "checkingResult",
            },
            on: {
              CHECK_RESULT_COMPLETE: [
                {
                  cond: "isHorizontalWin",
                  target: "#ticTacToe.gameEnd.win.horitzontalWin",
                  actions: "setWinningIndicies",
                },
                {
                  cond: "isVerticalWin",
                  target: "#ticTacToe.gameEnd.win.verticalWin",
                  actions: "setWinningIndicies",
                },
                {
                  cond: "isTopLeftdiagonalWin",
                  target: "#ticTacToe.gameEnd.win.topLeftdiagonalWin",
                  actions: "setWinningIndicies",
                },
                {
                  cond: "isTopRightdiagonalWin",
                  target: "#ticTacToe.gameEnd.win.topRightdiagonalWin",
                  actions: "setWinningIndicies",
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
              topRightdiagonalWin: { type: "final" },
              topLeftdiagonalWin: { type: "final" },
            },
          },
          draw: { type: "final" },
        },
      },
    },
  },
  {
    delays: {
      PC_DELAY: 500,
    },
    guards: {
      hasPersistedGame: (_) =>
        !!localStorage.getItem(localStorageKeys.currentGame),
      isEmptySlot: (context, event) => !context.board[event.row][event.column],
      isHorizontalWin: (_, event) => event.winType === WinType.HoritzontalWin,
      isVerticalWin: (_, event) => event.winType === WinType.VerticalWin,
      isTopLeftdiagonalWin: (_, event) =>
        event.winType === WinType.TopLeftdiagonalWin,
      isTopRightdiagonalWin: (_, event) =>
        event.winType === WinType.TopRightdiagonalWin,
      isDraw: (context) =>
        context.totalNumOfMoves ===
        context.board.length * context.board[0].length,
      isPlayerX: (context) => context.currentPlayer === Player.x,
      isPvC: (context) => context.playerMode === Mode.PvC,
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
      makeRandomMove: assign({
        board: (context) => {
          const copyBoard = deepCopyBoard(context.board);
          const emptySlots = copyBoard.reduce(
            (slots, column, rowIndex) => [
              ...slots,
              ...column.map((symbol, columnIndex) =>
                symbol ? "" : [rowIndex, columnIndex]
              ),
            ],
            [] as (string | number[])[]
          );
          const filteredEmptySlots = emptySlots.filter((slots) => !!slots);

          const randomIndex = Math.floor(
            Math.random() * filteredEmptySlots.length
          );
          const computerMovePosition = filteredEmptySlots[
            randomIndex
          ] as number[];

          console.log(randomIndex);

          copyBoard[computerMovePosition[0]][computerMovePosition[1]] =
            context.currentPlayer;

          return copyBoard;
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
          localStorageKeys.currentGame,
          JSON.stringify({
            board: context.board,
            currentPlayer: context.currentPlayer,
            totalNumOfMoves: context.totalNumOfMoves,
            playerMode: context.playerMode,
          })
        );
      },
      clearPersistedGame: () => {
        localStorage.removeItem(localStorageKeys.currentGame);
      },
      resetContext: assign((_) => ({
        board: deepCopyBoard(initalBoard),
        currentPlayer: Player.x,
        winningIndicies: undefined,
        totalNumOfMoves: 0,
        playerMode: undefined,
      })),
      setWinningIndicies: assign({
        winningIndicies: (_, event) => event.winningIndicies,
      }),
      addMoveCount: assign({
        totalNumOfMoves: (context) => context.totalNumOfMoves + 1,
      }),
      setCurrentGame: assign(() => {
        const game = JSON.parse(
          localStorage.getItem(localStorageKeys.currentGame) || ""
        );

        return game
          ? ({
              board: game.board,
              currentPlayer: game.currentPlayer,
              totalNumOfMoves: game.totalNumOfMoves,
              playerMode: game.playerMode,
            } as TicTacToeMachineContext)
          : {};
      }),
      setPlayerMode: assign({
        playerMode: (_, event) => event.playerMode,
      }),
    },
    services: {
      checkingResult: (context) => (send) => {
        const result: Pick<TicTacToeMachineContext, "winningIndicies"> & {
          winType?: WinType;
        } = { winType: undefined, winningIndicies: undefined };

        const isHorizontalWin = (): boolean => {
          return context.board.some((column, rowIndex) => {
            result.winningIndicies = [];
            return column.every((symbol, columnIndex) => {
              result.winningIndicies?.push(`(${rowIndex},${columnIndex})`);
              return symbol === context.currentPlayer;
            });
          });
        };

        const isVerticalWin = (): boolean => {
          return context.board[0].some((_, columnIndex) => {
            result.winningIndicies = [];
            return context.board.every((column, rowIndex) => {
              result.winningIndicies?.push(`(${rowIndex},${columnIndex})`);
              return column[columnIndex] === context.currentPlayer;
            });
          });
        };

        const diagonalWinResult = (): WinType | undefined => {
          const shallowCopyBoard = [...context.board];

          const isTopLeftDiagonalWin = () => {
            result.winningIndicies = [];
            return context.board.every((column, index) => {
              result.winningIndicies?.push(`(${index},${index})`);
              return column[index] === context.currentPlayer;
            });
          };

          const isTopRightDiagonalWin = () => {
            const lastIndexOfRow = shallowCopyBoard.length - 1;
            result.winningIndicies = [];
            return shallowCopyBoard.every((column, rowIndex) => {
              const columnIndex = lastIndexOfRow - rowIndex;
              result.winningIndicies?.push(`(${rowIndex},${columnIndex})`);
              return column[columnIndex] === context.currentPlayer;
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
            result.winningIndicies = undefined;
          }
        }

        send({ type: "CHECK_RESULT_COMPLETE", ...result });
      },
    },
  }
);

export default ticTacToeMachine;
