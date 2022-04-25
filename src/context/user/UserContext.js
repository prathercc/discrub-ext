import React, { createContext, useState } from "react";
import { GET_USER_DATA } from "./UserContextConstants";

export const UserContext = createContext();

const UserContextProvider = (props) => {
  const [state, setInitialState] = useState(
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
      hasFetchedData: false,
    })
  );
  const dispatch = (type, payload) => {
    console.info(type);
    switch (type) {
      case GET_USER_DATA:
        return setInitialState({ ...state, ...payload, hasFetchedData: true });
      default:
        return setInitialState({ ...state, ...payload });
    }
  };
  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {props.children}
    </UserContext.Provider>
  );
};

export default UserContextProvider;
