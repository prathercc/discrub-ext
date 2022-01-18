/*global chrome*/
import * as React from "react";
import { sendChromeMessage } from "./chromeService";
import InjectedDialog from "./components/InjectedDialog/InjectedDialog";

function App() {
  return (
    <>
      <InjectedDialog />
    </>
  );
}

export default App;
