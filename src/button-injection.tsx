import ReactDOM from "react-dom/client";
import DiscrubButton from "./containers/discrub-button/discrub-button.tsx";
import { ThemeProvider } from "@mui/material/styles";
import { theme } from "./theme.ts";

const injectionButton = document.getElementById("button_injection");
if (injectionButton) {
  ReactDOM.createRoot(injectionButton).render(
    <ThemeProvider theme={theme}>
      <DiscrubButton />
    </ThemeProvider>
  );
}
