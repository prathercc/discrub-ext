import { fetchUserData } from "../../discordService";
import { GET_USER_DATA, GET_USER_DATA_COMPLETE } from "./UserContextConstants";
import { sendChromeMessage } from "../../chromeService";

export const getUserData = async (dispatch) => {
  const chromeCallback = async (userToken) => {
    const data = await fetchUserData(userToken);
    if (data)
      dispatch({
        type: GET_USER_DATA_COMPLETE,
        payload: { ...data, token: userToken },
      });
  };

  dispatch({ type: GET_USER_DATA });
  sendChromeMessage("GET_TOKEN", chromeCallback);
};
