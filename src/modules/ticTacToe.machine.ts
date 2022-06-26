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
  wins?: Partial<Record<WinType, string[]>>; //['(rowIndex)','(columnIndex)']
  totalNumOfMoves: number;
  playerMode?: Mode;
}

type MoveEvent = { type: "MOVE"; row: number; column: number };
type StartGameEvent = { type: "START_GAME" };
type CheckResultCompleteEvent = {
  type: "CHECK_RESULT_COMPLETE";
  winType?: WinType;
  wins?: TicTacToeMachineContext["wins"];
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
                  cond: "isWin",
                  target: "#ticTacToe.gameEnd.win",
                  actions: "setWins",
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
          win: { type: "final" },
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
      isWin: (_, event) => !!event.wins,
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
        wins: undefined,
        totalNumOfMoves: 0,
        playerMode: undefined,
      })),
      setWins: assign({
        wins: (_, event) => event.wins,
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
        const init: TicTacToeMachineContext["wins"] = {};
        const result: TicTacToeMachineContext["wins"] = {};

        const isHorizontalWin = (): boolean => {
          return context.board.some((column, rowIndex) => {
            init.horitzontalWin = [];
            return column.every((symbol, columnIndex) => {
              init.horitzontalWin?.push(`(${rowIndex},${columnIndex})`);
              return symbol === context.currentPlayer;
            });
          });
        };

        const isVerticalWin = (): boolean => {
          return context.board[0].some((_, columnIndex) => {
            init.verticalWin = [];
            return context.board.every((column, rowIndex) => {
              init.verticalWin?.push(`(${rowIndex},${columnIndex})`);
              return column[columnIndex] === context.currentPlayer;
            });
          });
        };

        const diagonalWinResult = () => {
          const shallowCopyBoard = [...context.board];

          const isTopLeftDiagonalWin = () => {
            init.topLeftdiagonalWin = [];
            return context.board.every((column, index) => {
              init.topLeftdiagonalWin?.push(`(${index},${index})`);
              return column[index] === context.currentPlayer;
            });
          };

          const isTopRightDiagonalWin = () => {
            const lastIndexOfRow = shallowCopyBoard.length - 1;
            init.topRightdiagonalWin = [];
            return shallowCopyBoard.every((column, rowIndex) => {
              const columnIndex = lastIndexOfRow - rowIndex;
              init.topRightdiagonalWin?.push(`(${rowIndex},${columnIndex})`);
              return column[columnIndex] === context.currentPlayer;
            });
          };

          if (isTopLeftDiagonalWin()) {
            result.topLeftdiagonalWin = init.topLeftdiagonalWin;
          }
          if (isTopRightDiagonalWin()) {
            result.topRightdiagonalWin = init.topRightdiagonalWin;
          }
        };

        if (isHorizontalWin()) {
          result.horitzontalWin = init.horitzontalWin;
        }
        if (isVerticalWin()) {
          result.verticalWin = init.verticalWin;
        }
        diagonalWinResult();

        send({
          type: "CHECK_RESULT_COMPLETE",
          wins: Object.keys(result).length !== 0 ? result : undefined,
        });
      },
    },
  }
);

export default ticTacToeMachine;
