import React, { useState } from "react";
import { Button, Menu, MenuItem, DialogActions } from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import PauseButton from "../../../PauseButton/PauseButton";
import { useDispatch, useSelector } from "react-redux";
import { selectDm } from "../../../../features/dm/dmSlice";
import { selectGuild } from "../../../../features/guild/guildSlice";
import { selectChannel } from "../../../../features/channel/channelSlice";
import {
  exportMessages,
  selectExport,
  setIsGenerating,
} from "../../../../features/export/exportSlice";
import ExportUtils from "../../ExportUtils";

const Actions = ({ handleDialogClose, isDm, contentRef, bulk }) => {
  const dispatch = useDispatch();
  const { selectedDm } = useSelector(selectDm);
  const { selectedGuild } = useSelector(selectGuild);
  const { selectedExportChannels, selectedChannel, channels } =
    useSelector(selectChannel);
  const { isExporting } = useSelector(selectExport);

  const zipName = `${selectedDm.name || selectedGuild.name}`;
  const [anchorEl, setAnchorEl] = useState(null);
  const open = !!anchorEl;
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const exportUtils = new ExportUtils(
    contentRef,
    (e) => dispatch(setIsGenerating(e)),
    zipName
  );

  const handleExportSelected = async (format = "json") => {
    handleClose();
    const selectedChannels = isDm
      ? [selectedDm]
      : bulk
      ? channels.filter((c) => selectedExportChannels.some((id) => id === c.id))
      : [selectedChannel.id ? selectedChannel : selectedGuild];
    dispatch(exportMessages(selectedChannels, exportUtils, bulk, format));
  };

  return (
    <DialogActions>
      <Button color="secondary" variant="contained" onClick={handleDialogClose}>
        Cancel
      </Button>
      <PauseButton disabled={!isExporting} />
      <Button
        disabled={
          isExporting || (bulk && !isDm && selectedExportChannels.length === 0)
        }
        variant="contained"
        disableElevation
        onClick={handleClick}
        endIcon={<KeyboardArrowDownIcon />}
      >
        Export
      </Button>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem dense onClick={() => handleExportSelected("html")}>
          HTML
        </MenuItem>
        <MenuItem dense onClick={() => handleExportSelected("json")}>
          JSON
        </MenuItem>
      </Menu>
    </DialogActions>
  );
};

export default Actions;
