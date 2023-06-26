import React, { useState, useEffect, useContext } from "react";
import MenuBar from "./MenuBar/MenuBar";
import ChannelMessages from "../Messages/ChannelMessages/ChannelMessages";
import DirectMessages from "../Messages/DirectMessages/DirectMessages";
import Box from "@mui/material/Box";
import About from "./About/About";
import { UserContext } from "../../context/user/UserContext";
import CloseWindowButton from "./CloseWindowButton/CloseWindowButton";
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
import DiscrubDialogStyles from "./Styles/DiscrubDialog.styles";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { fetchAnnouncementData } from "../../announcementService";
import DonationComponent from "./DonationComponent/DonationComponent";
// import Sponsorship from "./Sponsorship/Sponsorship";

function DiscrubDialog() {
  const classes = DiscrubDialogStyles();

  const { getUserData } = useContext(UserContext);
  const { resetChannel } = useContext(ChannelContext);
  const {
    resetMessageData,
    resetFilters,
    setSearchAfterDate,
    setSearchBeforeDate,
  } = useContext(MessageContext);
  const { resetGuild } = useContext(GuildContext);
  const { resetDm } = useContext(DmContext);

  const [menuIndex, setMenuIndex] = useState(0);
  const [alertOpen, setAlertOpen] = useState(true);
  const [announcement, setAnnouncement] = useState(null);

  const handleChangeMenuIndex = async (index) => {
    await Promise.all([
      setSearchBeforeDate(null),
      setSearchAfterDate(null),
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
      {/* <Sponsorship /> */}
      <DonationComponent />
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
                <Typography className={classes.alertText} variant="body2">
                  <strong>
                    {announcement.title}
                    {announcement.date && ` - ${announcement.date}`}
                  </strong>
                </Typography>
              </AlertTitle>
              <Typography className={classes.alertText} variant="body2">
                {announcement.message}
              </Typography>
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
          <Typography variant="body2">1.10.9</Typography>
        </Stack>
      </Box>
      <CloseWindowButton />
    </Box>
  );
}

export default DiscrubDialog;
