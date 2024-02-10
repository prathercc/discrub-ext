import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme";
import { GlobalStyles } from "@mui/material";
import { scrollbarOverrides, audioOverrides } from "./theme";
import DiscrubDialog from "./containers/discrub-dialog/discrub-dialog";

function App() {
  return (
    <>
      <GlobalStyles
        styles={{
          ...scrollbarOverrides,
          ...audioOverrides,
        }}
      />
      <ThemeProvider theme={theme}>
        <DiscrubDialog />
      </ThemeProvider>
    </>
  );
}

export default App;
