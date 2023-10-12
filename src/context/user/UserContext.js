import React, { createContext, useReducer } from "react";
import { sendChromeMessage } from "../../services/chromeService";
import { fetchUserData } from "../../services/discordService";
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
      let data = null;
      if (userToken) data = await fetchUserData(userToken);
      return dispatch({
        type: GET_USER_DATA_COMPLETE,
        payload: { ...(data || {}), token: data ? userToken : undefined },
      });
    };

    dispatch({ type: GET_USER_DATA });
    return sendChromeMessage("GET_TOKEN", chromeCallback);
  };

  const getUserDataManually = async (userToken) => {
    if (userToken) {
      dispatch({ type: GET_USER_DATA });
      const data = await fetchUserData(userToken);
      if (data.code === 0 || data.code || !data) {
        await dispatch({
          type: GET_USER_DATA_COMPLETE,
          payload: { token: undefined },
        });
        return { successful: false };
      } else {
        await dispatch({
          type: GET_USER_DATA_COMPLETE,
          payload: { ...data, token: userToken },
        });
        return { successful: true };
      }
    }
  };

  return (
    <UserContext.Provider
      value={{ state, dispatch, getUserData, getUserDataManually }}
    >
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
