import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import DiscrubButton from "./components/DiscrubButton/DiscrubButton";
import reportWebVitals from "./reportWebVitals";
import AppTheme from "./AppTheme";

const injectionButton = document.getElementById("button_injection");
if (injectionButton) {
  ReactDOM.render(
    <AppTheme>
      <DiscrubButton />
    </AppTheme>,
    injectionButton
  );
}
const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.render(<App />, rootElement);
}
const injectionDialog = document.getElementById("dialog_injection");
if (injectionDialog) {
  ReactDOM.render(<App />, injectionDialog);
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
