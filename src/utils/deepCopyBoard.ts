import { Board } from "src/types/board";

export const deepCopyBoard = (board: Board) =>
  board.map((column) => [...column]);
