import ticTacToeMachine from "./ticTacToe.machine";
import { useActor, useInterpret } from "@xstate/react";
import React, { createContext, useContext } from "react";
import { InterpreterFrom } from "xstate";

const ticTacToeContext = createContext<
  InterpreterFrom<typeof ticTacToeMachine>
>(null as unknown as InterpreterFrom<typeof ticTacToeMachine>);

export const TicTacToeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const service = useInterpret(ticTacToeMachine, {});
  return (
    <ticTacToeContext.Provider
      value={service as unknown as InterpreterFrom<typeof ticTacToeMachine>}
    >
      {children}
    </ticTacToeContext.Provider>
  );
};

export const useTicTacToeActor = () => useActor(useContext(ticTacToeContext));
