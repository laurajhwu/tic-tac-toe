import { Button, Container, Typography } from "@mui/material";
import { useTicTacToeActor } from "src/modules/ticTacToe.context";

const Landing = () => {
  const [_, ticTacToeSend] = useTicTacToeActor();

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
    >
      <Typography
        variant="h1"
        sx={{
          mb: 5,
        }}
      >
        TIC-TAC-TOE
      </Typography>
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
      >
        START GAME
      </Button>
    </Container>
  );
};

export default Landing;
