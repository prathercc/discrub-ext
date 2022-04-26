import React from "react";
import InjectedDialog from "./components/InjectedDialog/InjectedDialog";
import ChannelContextProvider from "./context/channel/ChannelContext";
import GuildContextProvider from "./context/guild/GuildContext";
import UserContextProvider from "./context/user/UserContext";

function App() {
  return (
    <>
      <UserContextProvider>
        <GuildContextProvider>
          <ChannelContextProvider>
            <InjectedDialog />
          </ChannelContextProvider>
        </GuildContextProvider>
      </UserContextProvider>
    </>
  );
}

export default App;
