import React, { createContext, useCallback, useReducer } from "react";
import { getUserData as getUserDataAction } from "./UserContextActions";
import { UserReducer } from "./UserReducer";
export const UserContext = createContext();

const UserContextProvider = (props) => {
  const [state, dispatch] = useReducer(
    UserReducer,
    Object.freeze({
      accent_color: null,
      avatar: null,
      avatar_decoration: null,
      banner: null,
      banner_color: null,
      bio: null,
      discriminator: null,
      email: null,
      flags: null,
      id: null,
      locale: null,
      mfa_enabled: null,
      nsfw_allowed: null,
      phone: null,
      pronouns: null,
      public_flags: null,
      token: null,
      username: null,
      verified: null,
      isLoading: null,
    })
  );

  const getUserData = useCallback(async () => {
    await getUserDataAction(dispatch);
  }, []);

  return (
    <UserContext.Provider value={{ state, dispatch, getUserData }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
