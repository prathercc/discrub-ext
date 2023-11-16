import React, { useState } from "react";
import { alpha } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "../../DiscordTooltip/DiscordToolTip";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import FilterListOffIcon from "@mui/icons-material/FilterListOff";
import EditIcon from "@mui/icons-material/Edit";
import FilterComponent from "../FilterComponent/FilterComponent";
import DiscordTableStyles from "../Styles/DiscordTable.styles";
import ExportButton from "../../../Export/ExportButton/ExportButton";
import { Button, Collapse } from "@mui/material";
import { useDispatch, useSelector } from "react-redux";
import { selectDm } from "../../../../features/dm/dmSlice";
import {
  resetFilters,
  selectMessage,
} from "../../../../features/message/messageSlice";

const EnhancedTableToolbar = ({
  setFilterOpen,
  filterOpen,
  setDeleteModalOpen,
  setEditModalOpen,
}) => {
  const classes = DiscordTableStyles();

  const dispatch = useDispatch();
  const { selectedDm } = useSelector(selectDm);
  const { selectedMessages, discrubCancelled } = useSelector(selectMessage);

  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFilterToggle = () => {
    if (filterOpen) dispatch(resetFilters());
    setFilterOpen(!filterOpen);
  };

  const editDeleteExportDisabled = discrubCancelled;

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
            <Button
              color="secondary"
              startIcon={
                filterOpen ? <FilterListOffIcon /> : <FilterListIcon />
              }
              onClick={handleFilterToggle}
            >
              Quick Filtering
            </Button>
            <ExportButton
              disabled={editDeleteExportDisabled}
              setDialogOpen={setDialogOpen}
              dialogOpen={dialogOpen}
              isDm={!!selectedDm.id}
            />
          </Stack>

          <Collapse
            className={classes.collapse}
            orientation="vertical"
            in={filterOpen}
            unmountOnExit
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
                <IconButton
                  disabled={editDeleteExportDisabled}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  <DeleteIcon className={classes.icon} />
                </IconButton>
              </Tooltip>
              <Tooltip arrow title="Edit">
                <IconButton
                  disabled={editDeleteExportDisabled}
                  onClick={() => setEditModalOpen(true)}
                >
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
