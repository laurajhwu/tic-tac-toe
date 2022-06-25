import {
  Container,
  Grid,
  Typography,
  colors,
  Zoom,
  Button,
} from "@mui/material";
import GameEndDialog from "src/components/GameEndDialog";
import WinResultLine from "src/components/WinResultLine";
import { useTicTacToeActor } from "src/modules/ticTacToe.context";

const Game = () => {
  const [ticTacToeState, ticTacToeSend] = useTicTacToeActor();
  return (
    <Container
      sx={{
        p: 4,
      }}
    >
      <Grid container justifyContent="space-between" sx={{ pt: 10 }}>
        <Grid
          item
          sx={{
            p: 1,
            border: (theme) => `1px solid ${theme.palette.secondary.dark}`,
            borderRadius: "3px",
            color: ticTacToeState.matches({ playing: "xPlaying" })
              ? "white"
              : "black",
            bgcolor: (theme) =>
              ticTacToeState.matches({ playing: "xPlaying" })
                ? theme.palette.secondary.main
                : "transparent",
          }}
        >
          <Typography typography="h6">Player 1 (X)</Typography>
        </Grid>
        <Grid item>
          <Button
            color="secondary"
            variant="outlined"
            size="large"
            onClick={() => {
              ticTacToeSend("RESET_GAME");
            }}
          >
            RESET
          </Button>
        </Grid>
        <Grid
          item
          sx={{
            p: 1,
            border: (theme) => `1px solid ${theme.palette.secondary.dark}`,
            borderRadius: "1px",
            color: ticTacToeState.matches({ playing: "circlePlaying" })
              ? "white"
              : "black",
            bgcolor: (theme) =>
              ticTacToeState.matches({ playing: "circlePlaying" })
                ? theme.palette.secondary.main
                : "transparent",
          }}
        >
          <Typography typography="h6">Player 2 (O)</Typography>
        </Grid>
      </Grid>
      <Grid
        container
        sx={{
          width: ticTacToeState.context.board[0].length * 120,
          mx: "auto",
          mt: 10,
        }}
      >
        {ticTacToeState.context.board.map((column, rowIndex) => (
          <Grid
            key={rowIndex}
            container
            item
            xs={12}
            sx={{
              borderTop: (theme) =>
                rowIndex !== 0
                  ? `5px solid ${theme.palette.secondary.dark}`
                  : "none",
            }}
          >
            {column.map((symbol, columnIndex) => (
              <Grid
                key={`${rowIndex}${columnIndex}`}
                item
                xs={4}
                sx={{
                  borderLeft: (theme) =>
                    columnIndex !== 0
                      ? `5px solid ${theme.palette.secondary.dark}`
                      : "none",
                  height: 120,
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  position: "relative",
                  ...(!symbol &&
                    !ticTacToeState.matches("gameEnd") && {
                      ":hover": {
                        cursor: "pointer",
                        bgcolor: colors.purple[200],
                      },
                    }),
                }}
                onClick={() => {
                  ticTacToeSend({
                    type: "MOVE",
                    row: rowIndex,
                    column: columnIndex,
                  });
                }}
              >
                {ticTacToeState.context.winningIndicies?.includes(
                  `(${rowIndex},${columnIndex})`
                ) && <WinResultLine />}
                <Zoom in={!!symbol}>
                  <Typography variant="h1">{symbol}</Typography>
                </Zoom>
              </Grid>
            ))}
          </Grid>
        ))}
      </Grid>
      <GameEndDialog />
    </Container>
  );
};

export default Game;
