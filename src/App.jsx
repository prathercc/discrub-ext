import React from "react";
import AppTheme from "./AppTheme";
import DiscrubDialog from "./components/DiscrubDialog/DiscrubDialog";
import GlobalStyles from "@mui/material/GlobalStyles";

function App() {
  return (
    <>
      <GlobalStyles
        styles={{
          "&::-webkit-scrollbar": {
            width: "5px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#f1f1f1",
          },
          "&::-webkit-scrollbar-track": {
            background: "#888",
          },
        }}
      />
      <AppTheme>
        <DiscrubDialog />
      </AppTheme>
    </>
  );
}

export default App;
