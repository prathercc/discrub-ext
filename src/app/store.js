import { configureStore } from "@reduxjs/toolkit";
import userReducer from "../features/user/userSlice";
import channelReducer from "../features/channel/channelSlice";
import guildReducer from "../features/guild/guildSlice";
import dmReducer from "../features/dm/dmSlice";
import relationshipReducer from "../features/relationship/relationshipSlice";
import messageReducer from "../features/message/messageSlice";

export default configureStore({
  reducer: {
    user: userReducer,
    channel: channelReducer,
    guild: guildReducer,
    dm: dmReducer,
    relationship: relationshipReducer,
    message: messageReducer,
  },
});
