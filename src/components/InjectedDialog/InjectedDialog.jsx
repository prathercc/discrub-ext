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
import {
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import { DmContext } from "../../context/dm/DmContext";
import InjectedDialogStyles from "./InjectedDialog.styles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { fetchAnnouncementData } from "../../announcementService";

function InjectedDialog() {
  const classes = InjectedDialogStyles();

  const { getUserData } = useContext(UserContext);
  const { resetChannel } = useContext(ChannelContext);
  const { resetMessageData, resetFilters } = useContext(MessageContext);
  const { resetGuild } = useContext(GuildContext);
  const { resetDm } = useContext(DmContext);

  const [menuIndex, setMenuIndex] = useState(0);
  const [alertOpen, setAlertOpen] = useState(true);
  const [announcement, setAnnouncement] = useState(null);

  const handleChangeMenuIndex = async (index) => {
    await Promise.all([
      resetMessageData(),
      resetDm(),
      resetChannel(),
      resetGuild(),
      resetFilters(),
    ]);
    setMenuIndex(index);
    setAlertOpen(false);
  };

  useEffect(() => {
    const getAnnouncementData = async () => {
      const data = await fetchAnnouncementData();
      setAnnouncement(data);
    };
    getAnnouncementData();
    getUserData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={classes.boxContainer}>
      <MenuBar menuIndex={menuIndex} setMenuIndex={handleChangeMenuIndex} />
      {menuIndex === 0 && (
        <ChannelMessages closeAnnouncement={() => setAlertOpen(false)} />
      )}
      {menuIndex === 1 && <DirectMessages />}
      {menuIndex === 2 && <About />}
      {announcement && (
        <Box className={classes.alertBox}>
          {!alertOpen && (
            <Stack direction="row" justifyContent="center" alignItems="center">
              <Tooltip arrow title="Show Announcement">
                <IconButton
                  onClick={() => setAlertOpen(true)}
                  color="secondary"
                >
                  <ExpandLessIcon />
                </IconButton>
              </Tooltip>
            </Stack>
          )}
          <Collapse in={alertOpen}>
            <Alert severity="info" onClose={() => setAlertOpen(false)}>
              <AlertTitle sx={{ color: "rgb(1, 67, 97)" }}>
                <strong>
                  {announcement.title}
                  {announcement.date && ` - ${announcement.date}`}
                </strong>
              </AlertTitle>
              {announcement.message}
            </Alert>
          </Collapse>
        </Box>
      )}

      <Box className={classes.box}>
        <Typography variant="h6">1.8.3</Typography>
      </Box>
      <CloseWindowButton />
    </Box>
  );
}

export default InjectedDialog;
