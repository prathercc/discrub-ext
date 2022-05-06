import React from "react";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import { visuallyHidden } from "@mui/utils";
import { textSecondary, textPrimary } from "../../../styleConstants";

const EnhancedTableHead = (props) => {
  const {
    onSelectAllClick,
    order,
    orderBy,
    numSelected,
    rowCount,
    onRequestSort,
    columns,
  } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell
          sx={{ borderBottom: `1px solid ${textPrimary}` }}
          padding="checkbox"
        >
          <Checkbox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
            color="secondary"
          />
        </TableCell>
        {columns.map((column) => (
          <TableCell
            sx={{
              borderBottom: `1px solid ${textPrimary}`,
            }}
            key={column.id}
            align={column.numeric ? "right" : "left"}
            padding={column.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : "asc"}
              onClick={createSortHandler(column.id)}
              sx={{
                color: textSecondary,
                "&:hover": {
                  color: textSecondary,
                },
                "&.Mui-active": {
                  color: textSecondary,
                  "&:hover": {
                    color: textSecondary,
                  },
                  ".MuiTableSortLabel-icon": {
                    color: textSecondary,
                  },
                },
              }}
            >
              {column.label}
              {orderBy === column.id ? (
                <Box component="span" sx={visuallyHidden}>
                  {order === "desc" ? "sorted descending" : "sorted ascending"}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
        <TableCell
          sx={{ borderBottom: `1px solid ${textPrimary}` }}
          padding="checkbox"
        />
      </TableRow>
    </TableHead>
  );
};

export default EnhancedTableHead;
