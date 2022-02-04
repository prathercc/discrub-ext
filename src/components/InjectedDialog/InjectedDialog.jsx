import React, { useState, useEffect } from "react";
import MenuBar from "../MenuBar/MenuBar";
import CancelIcon from "@mui/icons-material/Cancel";
import { sendChromeMessage } from "../../chromeService";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import ChannelMessages from "../ChannelMessages/ChannelMessages";
import DirectMessages from "../DirectMessages/DirectMessages";
import Identity from "../Identity/Identity";
import { fetchUserData } from "../../discordService";
import Box from "@mui/material/Box";
import About from "../About/About";
import {
  discordPrimary,
  fontFamily,
  textSecondary,
} from "../../styleConstants";
import DiscordTypography from "../DiscordComponents/DiscordTypography/DiscordTypography";

function InjectedDialog() {
  const [menuIndex, setMenuIndex] = useState(0);
  const [userToken, setUserToken] = useState();
  const [userData, setUserData] = useState();
  useEffect(() => {
    sendChromeMessage("GET_TOKEN", setUserToken);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      const data = await fetchUserData(userToken);
      setUserData({ ...data, token: userToken });
    };
    if (userToken) getUserData();
  }, [userToken]);
  return (
    <Box
      sx={{
        backgroundColor: discordPrimary,
        height: "700px",
        width: "775px",
        color: textSecondary,
        fontFamily: fontFamily,
        padding: 0,
        margin: 0,
        border: `1px solid ${textSecondary.slice(0, 18) + "0.2)"}`,
        wordWrap: "break-word",
        overflow: "hidden",
        borderRadius: "1px",
      }}
    >
      <MenuBar menuIndex={menuIndex} setMenuIndex={setMenuIndex} />
      {menuIndex === 0 && <Identity userData={userData} />}
      {menuIndex === 1 && <ChannelMessages userData={userData} />}
      {menuIndex === 2 && <DirectMessages userData={userData} />}
      {menuIndex === 3 && <About userData={userData} />}
      <DevelopmentMessages />
      <CloseWindowButton />
    </Box>
  );
}

const CloseWindowButton = () => {
  return (
    <Box sx={{ position: "fixed", top: "5px", right: "5px" }}>
      <Tooltip title="Close">
        <IconButton
          sx={{
            "&:hover": { color: "rgb(166, 2, 2)" },
            color: textSecondary,
          }}
          onClick={() => sendChromeMessage("CLOSE_INJECTED_DIALOG")}
          color="primary"
        >
          <CancelIcon />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

const DevelopmentMessages = () => {
  return (
    <>
      <Box
        sx={{
          position: "fixed",
          bottom: "0px",
          left: "5px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <DiscordTypography>Discrub</DiscordTypography>
      </Box>
      <Box
        sx={{
          position: "fixed",
          bottom: "0px",
          right: "5px",
          opacity: 0.5,
          pointerEvents: "none",
        }}
      >
        <DiscordTypography>Version 1.0.2</DiscordTypography>
      </Box>
    </>
  );
};

export default InjectedDialog;
