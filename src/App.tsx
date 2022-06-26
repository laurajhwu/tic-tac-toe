import {
  TicTacToeProvider,
  useTicTacToeActor,
} from "src/modules/ticTacToe.context";
import { MainContent } from "src/features";
import { Layout } from "./layouts";
import { Global, css } from "@emotion/react";
import { ThemeProvider } from "@mui/material";
import { theme } from "src/constants/theme";

const App = () => {
  return (
    <ThemeProvider theme={theme}>
      <Global
        styles={css`
          body {
            margin: 0;
          }
        `}
      />
      <Layout>
        <TicTacToeProvider>
          <MainContent />
        </TicTacToeProvider>
      </Layout>
    </ThemeProvider>
  );
};

export default App;
