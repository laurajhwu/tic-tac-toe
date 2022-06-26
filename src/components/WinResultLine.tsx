import { match } from "ts-pattern";
import { colors, Divider as _Divider, styled } from "@mui/material";
import { WinType } from "src/types/game";

const Divider = styled(_Divider)({
  position: "absolute",
  borderWidth: 3,
  borderColor: colors.pink[900],
  zIndex: 1,
  backgroundColor: colors.pink[900],
});

interface WinResultLineProps {
  winType: WinType;
}

const WinResultLine: React.FC<WinResultLineProps> = ({ winType }) => {
  return match(winType)
    .with(WinType.HoritzontalWin, () => (
      <Divider
        sx={{
          width: "105%",
        }}
      />
    ))
    .with(WinType.VerticalWin, () => <Divider orientation="vertical" />)
    .with(WinType.TopRightdiagonalWin, () => (
      <Divider
        sx={{
          transform: "rotate(43.9deg)",
          height: "145%",
        }}
      />
    ))
    .with(WinType.TopLeftdiagonalWin, () => (
      <Divider
        sx={{
          transform: "rotate(-43.9deg)",
          height: "145%",
        }}
      />
    ))
    .otherwise(() => null);
};

export default WinResultLine;
