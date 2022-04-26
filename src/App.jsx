import React from "react";
import InjectedDialog from "./components/InjectedDialog/InjectedDialog";
import GuildContextProvider from "./context/guild/GuildContext";
import UserContextProvider from "./context/user/UserContext";

function App() {
  return (
    <>
      <UserContextProvider>
        <GuildContextProvider>
          <InjectedDialog />
        </GuildContextProvider>
      </UserContextProvider>
    </>
  );
}

export default App;
