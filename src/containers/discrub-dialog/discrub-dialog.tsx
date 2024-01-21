import { useState, useEffect } from "react";
import MenuBar from "./components/menu-bar";
// import ChannelMessages from "../Messages/ChannelMessages/ChannelMessages";
// import DirectMessages from "../Messages/DirectMessages/DirectMessages";
import About from "./components/about";
import CloseWindowButton from "./components/close-window-button";
import {
  Alert,
  AlertTitle,
  Collapse,
  IconButton,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import Tooltip from "../../common-components/tooltip/tooltip";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import {
  Announcement,
  fetchAnnouncementData,
} from "../../services/github-service";
import DonationComponent from "./components/donation-component";
import { useMessageSlice } from "../../features/message/use-message-slice";
import { useGuildSlice } from "../../features/guild/use-guild-slice";
import { useChannelSlice } from "../../features/channel/use-channel-slice";
import { useDmSlice } from "../../features/dm/use-dm-slice";
import { useAppSlice } from "../../features/app/use-app-slice";
import { useUserSlice } from "../../features/user/use-user-slice";
import { useTheme } from "@mui/material";
import Tags from "../tags/tags";

function DiscrubDialog() {
  const palette = useTheme().palette;
  const [menuIndex, setMenuIndex] = useState(0);
  const [alertOpen, setAlertOpen] = useState(true);
  const [announcement, setAnnouncement] = useState<Announcement | Maybe>(null);

  const closeAnnouncement = () => {
    setAlertOpen(false);
  };

  const { resetAdvancedFilters, resetMessageData, resetFilters } =
    useMessageSlice();

  const { resetGuild } = useGuildSlice();
  const { resetDm } = useDmSlice();
  const { resetChannel } = useChannelSlice();
  const { setDiscrubPaused } = useAppSlice();
  const { getUserData } = useUserSlice();

  const handleChangeMenuIndex = async (index: number) => {
    resetAdvancedFilters();
    resetMessageData();
    resetGuild();
    resetDm();
    resetChannel();
    resetFilters();
    setDiscrubPaused(false);
    setMenuIndex(index);
    closeAnnouncement();
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
    <Box
      sx={{
        backgroundColor: palette.background.default,
        border: `1px solid ${palette.secondary.dark}`,
        wordWrap: "break-word",
        overflow: "hidden",
        borderRadius: "6px",
        boxShadow: "10px 11px 7px -1px rgba(0,0,0,0.41)",
        height: "615px",
        maxHeight: "615px",
        maxWidth: "720px",
        width: "720px",
        p: 0,
        m: 0,
      }}
    >
      <DonationComponent closeAnnouncement={closeAnnouncement} />
      <MenuBar menuIndex={menuIndex} setMenuIndex={handleChangeMenuIndex} />
      {/* {menuIndex === 0 && (
        <ChannelMessages closeAnnouncement={() => setAlertOpen(false)} />
      )} */}
      {/* {menuIndex === 1 && <DirectMessages />} */}
      {menuIndex === 2 && <Tags />}
      {menuIndex === 3 && <About />}
      {announcement && (
        <Box
          sx={{
            position: "fixed",
            bottom: "54px",
            left: "268px",
            width: "714px",
          }}
        >
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
            <Alert variant="filled" severity="info" onClose={closeAnnouncement}>
              <AlertTitle>
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

      <Box sx={{ position: "fixed", top: "23px", right: "310px", opacity: 1 }}>
        <Stack
          direction="row"
          alignContent="center"
          justifyContent="center"
          spacing={1}
        >
          <Typography color="primary.main" variant="body2">
            1.11.6
          </Typography>
        </Stack>
      </Box>
      <CloseWindowButton />
    </Box>
  );
}

export default DiscrubDialog;
