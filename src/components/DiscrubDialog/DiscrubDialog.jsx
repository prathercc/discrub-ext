import React, { useState, useEffect } from "react";
import MenuBar from "./MenuBar/MenuBar";
import ChannelMessages from "../Messages/ChannelMessages/ChannelMessages";
import DirectMessages from "../Messages/DirectMessages/DirectMessages";
import Box from "@mui/material/Box";
import About from "./About/About";
import CloseWindowButton from "./CloseWindowButton/CloseWindowButton";
import {
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import Tooltip from "../DiscordComponents/DiscordTooltip/DiscordToolTip";
import DiscrubDialogStyles from "./Styles/DiscrubDialog.styles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { fetchAnnouncementData } from "../../services/announcementService";
import DonationComponent from "./DonationComponent/DonationComponent";
import { useDispatch } from "react-redux";
import { getUserData } from "../../features/user/userSlice";
import {
  resetAdvancedFilters,
  resetFilters,
  resetMessageData,
} from "../../features/message/messageSlice";
import { resetDm } from "../../features/dm/dmSlice";
import { resetChannel } from "../../features/channel/channelSlice";
import { resetGuild } from "../../features/guild/guildSlice";
import { setDiscrubPaused } from "../../features/app/appSlice";
import Tags from "../../containers/Tags/Tags";

function DiscrubDialog() {
  const classes = DiscrubDialogStyles();

  const dispatch = useDispatch();

  const [menuIndex, setMenuIndex] = useState(0);
  const [alertOpen, setAlertOpen] = useState(true);
  const [announcement, setAnnouncement] = useState(null);

  const handleChangeMenuIndex = async (index) => {
    dispatch(resetAdvancedFilters());
    dispatch(resetMessageData());
    dispatch(resetGuild());
    dispatch(resetDm());
    dispatch(resetChannel());
    dispatch(resetFilters());
    dispatch(setDiscrubPaused(false));
    setMenuIndex(index);
    setAlertOpen(false);
  };

  useEffect(() => {
    const getAnnouncementData = async () => {
      const data = await fetchAnnouncementData();
      setAnnouncement(data);
    };
    getAnnouncementData();
    dispatch(getUserData());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box className={classes.boxContainer}>
      <DonationComponent />
      <MenuBar menuIndex={menuIndex} setMenuIndex={handleChangeMenuIndex} />
      {menuIndex === 0 && (
        <ChannelMessages closeAnnouncement={() => setAlertOpen(false)} />
      )}
      {menuIndex === 1 && <DirectMessages />}
      {menuIndex === 2 && <Tags />}
      {menuIndex === 3 && <About />}
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
              <AlertTitle sx={{ color: "rgb(1, 67, 97) !important" }}>
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
        <Stack
          direction="row"
          alignContent="center"
          justifyContent="center"
          spacing={1}
        >
          <Typography variant="body2">1.11.4</Typography>
        </Stack>
      </Box>
      <CloseWindowButton />
    </Box>
  );
}

export default DiscrubDialog;
