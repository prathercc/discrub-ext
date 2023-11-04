import React from "react";
import Box from "@mui/material/Box";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import { visuallyHidden } from "@mui/utils";
import DiscordTableStyles from "../Styles/DiscordTable.styles";
import { useSelector } from "react-redux";
import { selectMessage } from "../../../../features/message/messageSlice";

const EnhancedTableHead = ({
  onSelectAllClick,
  order,
  orderBy,
  rowCount,
  onRequestSort,
  columns,
}) => {
  const classes = DiscordTableStyles();

  const { selectedMessages } = useSelector(selectMessage);

  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell className={classes.tablecell} padding="checkbox">
          <Checkbox
            indeterminate={
              selectedMessages.length > 0 && selectedMessages.length < rowCount
            }
            checked={rowCount > 0 && selectedMessages.length === rowCount}
            onChange={onSelectAllClick}
            color="secondary"
          />
        </TableCell>
        {columns.map((column) => (
          <TableCell
            className={classes.tablecell}
            key={column.id}
            align="left"
            padding={column.disablePadding ? "none" : "normal"}
            sortDirection={orderBy === column.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === column.id}
              direction={orderBy === column.id ? order : "asc"}
              onClick={createSortHandler(column.id)}
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
        <TableCell className={classes.tablecell} padding="checkbox" />
      </TableRow>
    </TableHead>
  );
};

export default EnhancedTableHead;
