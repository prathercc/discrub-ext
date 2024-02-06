import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { GlobalStyles } from "@mui/material";
import DiscrubDialog from "./containers/discrub-dialog/discrub-dialog";

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
      <ThemeProvider theme={theme}>
        <DiscrubDialog />
      </ThemeProvider>
    </>
  );
}

export default App;
