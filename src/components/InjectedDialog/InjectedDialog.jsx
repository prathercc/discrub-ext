import React, { useState, useEffect, useContext } from "react";
import MenuBar from "../MenuBar/MenuBar";
import ChannelMessages from "../ChannelMessages/ChannelMessages";
import DirectMessages from "../DirectMessages/DirectMessages";
import Box from "@mui/material/Box";
import About from "../About/About";
import { UserContext } from "../../context/user/UserContext";
import CloseWindowButton from "./CloseWindowButton";
import { MessageContext } from "../../context/message/MessageContext";
import { ChannelContext } from "../../context/channel/ChannelContext";
import { GuildContext } from "../../context/guild/GuildContext";
import { Typography } from "@mui/material";
import { DmContext } from "../../context/dm/DmContext";
import InjectedDialogStyles from "./InjectedDialog.styles";

function InjectedDialog() {
  const classes = InjectedDialogStyles();

  const { getUserData } = useContext(UserContext);
  const { resetChannel } = useContext(ChannelContext);
  const { resetMessageData, resetFilters } = useContext(MessageContext);
  const { resetGuild } = useContext(GuildContext);
  const { resetDm } = useContext(DmContext);

  const [menuIndex, setMenuIndex] = useState(0);

  const handleChangeMenuIndex = async (index) => {
    await Promise.all([
      resetMessageData(),
      resetDm(),
      resetChannel(),
      resetGuild(),
      resetFilters(),
    ]);
    setMenuIndex(index);
  };

  useEffect(() => {
    getUserData();
  }, [getUserData]);

  return (
    <Box className={classes.boxContainer}>
      <MenuBar menuIndex={menuIndex} setMenuIndex={handleChangeMenuIndex} />
      {menuIndex === 0 && <ChannelMessages />}
      {menuIndex === 1 && <DirectMessages />}
      {menuIndex === 2 && <About />}
      <Box className={classes.box}>
        <Typography>Version 1.1.0</Typography>
      </Box>
      <CloseWindowButton />
    </Box>
  );
}

export default InjectedDialog;
