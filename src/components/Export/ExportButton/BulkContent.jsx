import React, { useContext } from "react";
import {
  DialogContent,
  DialogContentText,
  IconButton,
  Stack,
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
  Checkbox,
  Box,
  Typography,
} from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { DmContext } from "../../../context/dm/DmContext";
import ImageToggle from "./ImageToggle";
import ExportButtonStyles from "./Styles/ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";
import Progress from "./Progress";
import PreviewImageToggle from "./PreviewImageToggle";
import ShowAvatarsToggle from "./ShowAvatarsToggle";
import PerPage from "./PerPage";
import SortDirectionToggle from "./SortDirectionToggle";

const BulkContent = ({ isDm = false }) => {
  const classes = ExportButtonStyles();

  const { state: exportState } = useContext(ExportContext);
  const { isExporting } = exportState;

  const { state: dmState } = useContext(DmContext);
  const { state: channelState, setSelectedExportChannels } =
    useContext(ChannelContext);
  const { channels, selectedExportChannels } = channelState;
  const { selectedDm } = dmState;

  const handleChannelSelect = (id) => {
    const isSelected = selectedExportChannels.some((cId) => cId === id);
    if (isSelected)
      setSelectedExportChannels([
        ...selectedExportChannels.filter((cId) => cId !== id),
      ]);
    else setSelectedExportChannels([...selectedExportChannels, id]);
  };

  return (
    <DialogContent>
      {!isExporting && !isDm && (
        <>
          <DialogContentText>
            <Typography variant="body2">Select Channel(s) to export</Typography>
          </DialogContentText>
          <Stack
            direction="column"
            justifyContent="center"
            alignItems="center"
            spacing={3}
          >
            <Box className={classes.dialogChannelsBox}>
              <List disablePadding dense>
                {channels.map((channel) => (
                  <ListItem key={channel.id} value={channel.id} dense>
                    <ListItemButton
                      role={undefined}
                      onClick={() => handleChannelSelect(channel.id)}
                      dense
                    >
                      <ListItemIcon>
                        <Checkbox
                          size="small"
                          edge="start"
                          checked={selectedExportChannels.some(
                            (cId) => cId === channel.id
                          )}
                          tabIndex={-1}
                          disableRipple
                        />
                      </ListItemIcon>
                      <ListItemText primary={channel.name} />
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Box>
            <Stack
              className={classes.dialogBtnStack}
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Tooltip
                arrow
                title={
                  selectedExportChannels.length ? "Deselect All" : "Select All"
                }
              >
                <IconButton
                  onClick={() =>
                    setSelectedExportChannels(
                      selectedExportChannels.length
                        ? []
                        : channels.map((c) => c.id)
                    )
                  }
                  color={
                    selectedExportChannels.length ? "secondary" : "primary"
                  }
                >
                  {selectedExportChannels.length ? (
                    <DeselectIcon />
                  ) : (
                    <SelectAllIcon />
                  )}
                </IconButton>
              </Tooltip>
              <Stack
                className={classes.dialogBtnStack}
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
                spacing={1}
              >
                <SortDirectionToggle />
                <ShowAvatarsToggle />
                <PreviewImageToggle />
                <ImageToggle />
              </Stack>
            </Stack>
            <Stack
              className={classes.dialogBtnStack}
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
            >
              <PerPage />
            </Stack>
          </Stack>
        </>
      )}
      {!isExporting && isDm && (
        <>
          <DialogContentText>
            <Typography variant="body2">
              Exporting messages from <strong>@{selectedDm?.name}</strong>
            </Typography>
          </DialogContentText>
          <Stack
            className={classes.dialogBtnStack}
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            spacing={1}
          >
            <SortDirectionToggle />
            <ShowAvatarsToggle />
            <PreviewImageToggle />
            <ImageToggle />
          </Stack>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <PerPage />
          </Stack>
        </>
      )}
      {isExporting && <Progress />}
    </DialogContent>
  );
};

export default BulkContent;
