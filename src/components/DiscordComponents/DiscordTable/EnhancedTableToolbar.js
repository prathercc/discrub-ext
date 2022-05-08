import React from "react";
import { alpha } from "@mui/material/styles";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Stack from "@mui/material/Stack";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import EditIcon from "@mui/icons-material/Edit";

import { textSecondary } from "../../../styleConstants";
import ExportButtonGroup from "../../Export/ExportButtonGroup";
import FilterComponent from "./FilterComponent";

const EnhancedTableToolbar = (props) => {
  const {
    numSelected,
    setFilterOpen,
    filterOpen,
    handleFilterUpdate,
    setDeleteModalOpen,
    setEditModalOpen,
    rows,
    exportTitle,
  } = props;

  return (
    <Toolbar
      sx={{
        pl: { sm: 2 },
        pr: { xs: 1, sm: 1 },
        ...(numSelected > 0 && {
          bgcolor: (theme) =>
            alpha(
              theme.palette.primary.main,
              theme.palette.action.activatedOpacity
            ),
        }),
      }}
    >
      <Stack sx={{ width: "100%" }} direction="column">
        <Stack sx={{ width: "100%" }} alignItems="baseline" direction="column">
          <Stack
            sx={{ width: "100%" }}
            direction="row"
            justifyContent="space-between"
          >
            <Tooltip title="Filter list">
              <IconButton onClick={() => setFilterOpen(!filterOpen)}>
                <FilterListIcon sx={{ color: textSecondary }} />
              </IconButton>
            </Tooltip>
            <IconButton>
              <ExportButtonGroup rows={rows} exportTitle={exportTitle} />
            </IconButton>
          </Stack>
          {filterOpen && (
            <FilterComponent handleFilterUpdate={handleFilterUpdate} />
          )}
        </Stack>

        {numSelected > 0 && (
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >
            <Typography
              sx={{ color: textSecondary }}
              color="inherit"
              variant="subtitle1"
              component="div"
            >
              {numSelected} selected
            </Typography>
            <Stack justifyContent="flex-end" direction="row">
              <Tooltip title="Delete">
                <IconButton onClick={() => setDeleteModalOpen(true)}>
                  <DeleteIcon sx={{ color: textSecondary }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Edit">
                <IconButton onClick={() => setEditModalOpen(true)}>
                  <EditIcon sx={{ color: textSecondary }} />
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
