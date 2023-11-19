import React from "react";
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
import Tooltip from "../../../DiscordComponents/DiscordTooltip/DiscordToolTip";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import DeselectIcon from "@mui/icons-material/Deselect";
import ImageToggle from "../ImageToggle/ImageToggle";
import ExportButtonStyles from "../Styles/ExportButton.styles";
import Progress from "../Progress/Progress";
import PreviewImageToggle from "../PreviewImageToggle/PreviewImageToggle";
import PerPage from "../PerPage/PerPage";
import SortDirectionToggle from "../SortDirectionToggle/SortDirectionToggle";
import { useDispatch, useSelector } from "react-redux";
import { selectExport } from "../../../../features/export/exportSlice";
import { selectDm } from "../../../../features/dm/dmSlice";
import {
  selectChannel,
  setSelectedExportChannels,
} from "../../../../features/channel/channelSlice";

const BulkContent = ({ isDm = false }) => {
  const classes = ExportButtonStyles();
  const dispatch = useDispatch();

  const { isExporting } = useSelector(selectExport);
  const { selectedDm } = useSelector(selectDm);
  const { channels, selectedExportChannels } = useSelector(selectChannel);

  const handleChannelSelect = (id) => {
    const isSelected = selectedExportChannels.some((cId) => cId === id);
    if (isSelected) {
      dispatch(
        setSelectedExportChannels([
          ...selectedExportChannels.filter((cId) => cId !== id),
        ])
      );
    } else {
      dispatch(setSelectedExportChannels([...selectedExportChannels, id]));
    }
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
              alignItems="center"
            >
              <Tooltip
                arrow
                title={
                  selectedExportChannels.length ? "Deselect All" : "Select All"
                }
              >
                <IconButton
                  onClick={() =>
                    dispatch(
                      setSelectedExportChannels(
                        selectedExportChannels.length
                          ? []
                          : channels.map((c) => c.id)
                      )
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
                className={classes.exportOptions}
                direction="column"
                justifyContent="flex-end"
                spacing={1}
                alignItems="center"
              >
                <Typography variant="body2">Export Options</Typography>
                <Stack
                  className={classes.dialogBtnStack}
                  direction="row"
                  spacing={1}
                >
                  <SortDirectionToggle />
                  <PreviewImageToggle />
                  <ImageToggle />
                </Stack>
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
          <Stack direction="row" justifyContent="flex-end" mt={1} mb={1}>
            <Stack
              className={classes.exportOptions}
              direction="column"
              spacing={1}
              alignItems="center"
            >
              <Typography variant="body2">Export Options</Typography>
              <Stack
                className={classes.dialogBtnStack}
                direction="row"
                spacing={1}
              >
                <SortDirectionToggle />
                <PreviewImageToggle />
                <ImageToggle />
              </Stack>
            </Stack>
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
