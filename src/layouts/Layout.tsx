import { Box, colors } from "@mui/material";
import React from "react";

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Box
      sx={{
        bgcolor: colors.purple[50],
        width: "100vw",
        height: "100vh",
      }}
    >
      {children}
    </Box>
  );
};

export default Layout;
