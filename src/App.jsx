import React from "react";
import InjectedDialog from "./components/InjectedDialog/InjectedDialog";
import UserContextProvider from "./context/user/UserContext";

function App() {
  return (
    <>
      <UserContextProvider>
        <InjectedDialog />
      </UserContextProvider>
    </>
  );
}

export default App;
