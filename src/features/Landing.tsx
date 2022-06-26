import { Button, Container, Typography, Grid } from "@mui/material";
import { useTicTacToeActor } from "src/modules/ticTacToe.context";
import { Mode } from "src/types/player";

const Landing = () => {
  const [ticTacToeState, ticTacToeSend] = useTicTacToeActor();

  return (
    <Container
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        mx: "auto",
        height: "100%",
        flexDirection: "column",
      }}
      data-testid="landingPage"
    >
      <Typography
        variant="h1"
        sx={{
          mb: 5,
        }}
      >
        TIC-TAC-TOE
      </Typography>
      <Typography
        variant="h6"
        sx={{
          mb: 1,
        }}
      >
        SELECT PLAYER MODE
      </Typography>
      <Grid container justifyContent="space-evenly" sx={{ mb: 10 }}>
        <Grid item>
          <Button
            variant={
              ticTacToeState.context.playerMode === Mode.PvP
                ? "contained"
                : "outlined"
            }
            color="primary"
            size="large"
            onClick={() => {
              ticTacToeSend({
                type: "SELECT_PLAYER_MODE",
                playerMode: Mode.PvP,
              });
            }}
          >
            Player vs Player
          </Button>
        </Grid>
        <Grid item>
          <Button
            variant={
              ticTacToeState.context.playerMode === Mode.PvC
                ? "contained"
                : "outlined"
            }
            color="primary"
            size="large"
            onClick={() => {
              ticTacToeSend({
                type: "SELECT_PLAYER_MODE",
                playerMode: Mode.PvC,
              });
            }}
          >
            Player vs Computer
          </Button>
        </Grid>
      </Grid>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          ticTacToeSend({ type: "START_GAME" });
        }}
        sx={{
          width: 200,
          height: 50,
          fontSize: (theme) => theme.typography.h5,
        }}
        disabled={!ticTacToeState.context.playerMode}
        data-testid="startButton"
      >
        START GAME
      </Button>
    </Container>
  );
};

export default Landing;
