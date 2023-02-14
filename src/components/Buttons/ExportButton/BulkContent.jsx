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
  CircularProgress,
  Typography,
} from "@mui/material";
import Tooltip from "../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import { ChannelContext } from "../../../context/channel/ChannelContext";
import { MessageContext } from "../../../context/message/MessageContext";
import { DmContext } from "../../../context/dm/DmContext";
import ImageToggle from "./ImageToggle";
import ExportButtonStyles from "./ExportButton.styles";
import { ExportContext } from "../../../context/export/ExportContext";

const BulkContent = ({ isDm = false }) => {
  const classes = ExportButtonStyles();

  const { state: exportState } = useContext(ExportContext);
  const { isExporting, name, statusText } = exportState;

  const { state: messageState } = useContext(MessageContext);

  const { state: dmState } = useContext(DmContext);
  const { state: channelState, setSelectedExportChannels } =
    useContext(ChannelContext);
  const { fetchedMessageLength } = messageState;
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
          <DialogContentText>Select Channel(s) to export</DialogContentText>
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
              <ImageToggle />
            </Stack>
          </Stack>
        </>
      )}
      {isDm && (
        <>
          <DialogContentText>
            Exporting messages from <strong>@{selectedDm?.name}</strong>
          </DialogContentText>
          <Stack
            className={classes.dialogBtnStack}
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
            <ImageToggle />
          </Stack>
        </>
      )}
      {isExporting && (
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="center"
          spacing={2}
          className={classes.dialogStatusStack}
        >
          <Typography>{name}</Typography>
          <CircularProgress />
          <Typography variant="caption">
            {statusText || (
              <>
                {`${fetchedMessageLength} Messages Found` || "Processing Data"}
              </>
            )}
          </Typography>
        </Stack>
      )}
    </DialogContent>
  );
};

export default BulkContent;
