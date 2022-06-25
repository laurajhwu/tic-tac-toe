import { Dialog, DialogContent, DialogTitle, Typography } from "@mui/material";
import { useState } from "react";
import { useTicTacToeActor } from "src/modules/ticTacToe.context";
import { Player } from "src/types/player";
import { match } from "ts-pattern";

const GameEndDialog = () => {
  const [ticTacToeState] = useTicTacToeActor();
  const [isClose, setIsClose] = useState(false);
  return (
    <Dialog
      open={!isClose && ticTacToeState.matches("gameEnd")}
      maxWidth="sm"
      fullWidth
      sx={{ textAlign: "center" }}
      onClose={() => setIsClose(true)}
    >
      <DialogContent
        sx={{
          py: 10,
        }}
      >
        <Typography variant="h3">
          {ticTacToeState.matches({ gameEnd: "win" }) &&
            match(ticTacToeState.context.currentPlayer)
              .with(Player.x, () => "Player 1 Wins!")
              .with(Player.o, () => "Player 2 Wins!")
              .exhaustive()}
          {ticTacToeState.matches({ gameEnd: "draw" }) && "It's a Draw!"}
        </Typography>
      </DialogContent>
    </Dialog>
  );
};

export default GameEndDialog;
