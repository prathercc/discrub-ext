import { Action, ThunkAction, configureStore } from "@reduxjs/toolkit";
import appReducer from "../features/app/app-slice";
import channelReducer from "../features/channel/channel-slice";
import userReducer from "../features/user/user-slice";
import threadReducer from "../features/thread/thread-slice";
import dmReducer from "../features/dm/dm-slice";
import guildReducer from "../features/guild/guild-slice";
import relationshipReducer from "../features/relationship/relationship-slice";
import purgeReducer from "../features/purge/purge-slice";
import exportReducer from "../features/export/export-slice";
import messageReducer from "../features/message/message-slice";

export const store = configureStore({
  reducer: {
    app: appReducer,
    channel: channelReducer,
    dm: dmReducer,
    export: exportReducer,
    guild: guildReducer,
    message: messageReducer,
    purge: purgeReducer,
    relationship: relationshipReducer,
    thread: threadReducer,
    user: userReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
