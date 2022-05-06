import React from "react";
import AppTheme from "./AppTheme";
import InjectedDialog from "./components/InjectedDialog/InjectedDialog";
import ChannelContextProvider from "./context/channel/ChannelContext";
import GuildContextProvider from "./context/guild/GuildContext";
import MessageContextProvider from "./context/message/MessageContext";
import UserContextProvider from "./context/user/UserContext";

function App() {
  return (
    <AppTheme>
      <UserContextProvider>
        <GuildContextProvider>
          <ChannelContextProvider>
            <MessageContextProvider>
              <InjectedDialog />
            </MessageContextProvider>
          </ChannelContextProvider>
        </GuildContextProvider>
      </UserContextProvider>
    </AppTheme>
  );
}

export default App;
