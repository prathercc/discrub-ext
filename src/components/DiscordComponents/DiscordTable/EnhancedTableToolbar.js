import React, { useContext, useState } from "react";
import { alpha } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../DiscordTooltip/DiscordToolTip";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import { MessageContext } from "../../../context/message/MessageContext";
import FilterComponent from "./FilterComponent";
import DiscordTableStyles from "./DiscordTable.styles";
import ExportButton from "../../Export/ExportButton/ExportButton";
import { DmContext } from "../../../context/dm/DmContext";
import { Collapse } from "@mui/material";

const EnhancedTableToolbar = ({
  setFilterOpen,
  filterOpen,
  setDeleteModalOpen,
  setEditModalOpen,
}) => {
  const classes = DiscordTableStyles();

  const { state: dmState } = useContext(DmContext);
  const { selectedDm } = dmState;
  const { state: messageState, resetFilters } = useContext(MessageContext);
  const { selectedMessages } = messageState;

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFilterToggle = () => {
    if (filterOpen) resetFilters();
    setFilterOpen(!filterOpen);
  };

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(selectedMessages.length > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      <Stack className={classes.stack} direction="column">
        <Stack
          className={classes.stack}
          alignItems="baseline"
          direction="column"
          spacing={2}
          mb="10px"
        >
          <Stack
            className={classes.stack}
            mt="20px"
            direction="row"
            justifyContent="space-between"
            zIndex={2} // This ensures that the Export options show over FilterComponent
          >
            <Tooltip
              arrow
              placement="right"
              title={`${filterOpen ? "Close" : "Open"} Quick Filters`}
            >
              <IconButton onClick={handleFilterToggle}>
                <FilterListIcon className={classes.icon} />
              </IconButton>
            </Tooltip>
            <IconButton>
              <ExportButton
                setDialogOpen={setDialogOpen}
                dialogOpen={dialogOpen}
                isDm={!!selectedDm.id}
              />
            </IconButton>
          </Stack>

          <Collapse
            className={classes.collapse}
            orientation="vertical"
            in={filterOpen}
          >
            <FilterComponent />
          </Collapse>
        </Stack>

        {selectedMessages.length > 0 && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography variant="subtitle1" component="div">
              {selectedMessages.length} selected
            </Typography>
            <Stack justifyContent="flex-end" direction="row">
              <Tooltip arrow title="Delete">
                <IconButton onClick={() => setDeleteModalOpen(true)}>
                  <DeleteIcon className={classes.icon} />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title="Edit">
                <IconButton onClick={() => setEditModalOpen(true)}>
                  <EditIcon className={classes.icon} />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Toolbar>
  );
};

export default EnhancedTableToolbar;
