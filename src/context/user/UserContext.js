import React, { createContext, useReducer } from "react";
import { sendChromeMessage } from "../../chromeService";
import { fetchUserData } from "../../discordService";
import { GET_USER_DATA, GET_USER_DATA_COMPLETE } from "./UserContextConstants";
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

  const getUserData = async () => {
    const chromeCallback = async (userToken) => {
      const data = await fetchUserData(userToken);
      if (data)
        return dispatch({
          type: GET_USER_DATA_COMPLETE,
          payload: { ...data, token: userToken },
        });
    };

    dispatch({ type: GET_USER_DATA });
    return sendChromeMessage("GET_TOKEN", chromeCallback);
  };

  return (
    <UserContext.Provider value={{ state, dispatch, getUserData }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
