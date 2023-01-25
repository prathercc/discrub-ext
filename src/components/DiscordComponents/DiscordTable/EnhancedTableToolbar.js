import React, { useContext } from "react";
import { alpha } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";
import { MessageContext } from "../../../context/message/MessageContext";
import ExportButtonGroup from "../../Export/ExportButtonGroup";
import FilterComponent from "./FilterComponent";
import DiscordTableStyles from "./DiscordTable.styles";
import classnames from "classnames";

const EnhancedTableToolbar = ({
  setFilterOpen,
  filterOpen,
  setDeleteModalOpen,
  setEditModalOpen,
}) => {
  const classes = DiscordTableStyles();

  const { state: messageState } = useContext(MessageContext);
  const { selectedMessages } = messageState;

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
      <Stack
        className={classnames(classes.stack, classes.toolbar)}
        direction="column"
      >
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
            <Tooltip arrow title="Filter list">
              <IconButton onClick={() => setFilterOpen(!filterOpen)}>
                <FilterListIcon className={classes.icon} />
              </IconButton>
            </Tooltip>
            <IconButton>
              <ExportButtonGroup />
            </IconButton>
          </Stack>
          {filterOpen && <FilterComponent />}
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
