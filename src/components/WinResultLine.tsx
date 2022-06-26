import { useTicTacToeActor } from "src/modules/ticTacToe.context";
import { match } from "ts-pattern";
import { colors, Divider as _Divider, styled } from "@mui/material";

const Divider = styled(_Divider)({
  position: "absolute",
  borderWidth: 3,
  borderColor: colors.pink[900],
  zIndex: 1,
  backgroundColor: colors.pink[900],
});

const WinResultLine = () => {
  const [ticTacToeState] = useTicTacToeActor();

  return match(ticTacToeState)
    .when(
      (state) => state.matches({ gameEnd: { win: "horitzontalWin" } }),
      () => (
        <Divider
          sx={{
            width: "105%",
          }}
        />
      )
    )
    .when(
      (state) => state.matches({ gameEnd: { win: "verticalWin" } }),
      () => <Divider orientation="vertical" />
    )
    .when(
      (state) => state.matches({ gameEnd: { win: "topRightdiagonalWin" } }),
      () => (
        <Divider
          sx={{
            transform: "rotate(43.9deg)",
            height: "145%",
          }}
        />
      )
    )
    .when(
      (state) => state.matches({ gameEnd: { win: "topLeftdiagonalWin" } }),
      () => (
        <Divider
          sx={{
            transform: "rotate(-43.9deg)",
            height: "145%",
          }}
        />
      )
    )
    .otherwise(() => null);
};

export default WinResultLine;
