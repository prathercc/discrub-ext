import React, { useState, useEffect } from "react";
import { alpha } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DeleteIcon from "@mui/icons-material/Delete";
import FilterListIcon from "@mui/icons-material/FilterList";
import { visuallyHidden } from "@mui/utils";
import EditIcon from "@mui/icons-material/Edit";
import DiscordTextField from "../DiscordTextField/DiscordTextField";
import Grid from "@mui/material/Grid";
import DiscordDateTimePicker from "../DiscordDateTimePicker/DiscordDateTimePicker";
import DiscordCheckBox from "../DiscordCheckBox/DiscordCheckBox";
import DiscordDeleteModal from "../DiscordModal/DiscordDeleteModal";
import DiscordEditModal from "../DiscordModal/DiscordEditModal";
import AttachmentIcon from "@mui/icons-material/Attachment";
import DiscordAttachmentModal from "../DiscordModal/DiscordAttachmentModal";

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === "desc"
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function EnhancedTableHead(props) {
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
          sx={{ borderBottom: "1px solid rgb(88, 101, 242)" }}
          padding="checkbox"
        >
          <DiscordCheckBox
            indeterminate={numSelected > 0 && numSelected < rowCount}
            checked={rowCount > 0 && numSelected === rowCount}
            onChange={onSelectAllClick}
          />
        </TableCell>
        {columns.map((column) => (
          <TableCell
            sx={{
              color: "rgb(210, 213, 247)",
              borderBottom: "1px solid rgb(88, 101, 242)",
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
          sx={{ borderBottom: "1px solid rgb(88, 101, 242)" }}
          padding="checkbox"
        />
      </TableRow>
    </TableHead>
  );
}

const EnhancedTableToolbar = (props) => {
  const {
    numSelected,
    setFilterOpen,
    filterOpen,
    handleFilterUpdate,
    setDeleteModalOpen,
    setEditModalOpen,
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
      {numSelected > 0 ? (
        <Typography
          sx={{ flex: "1 1 100%", color: "rgb(210, 213, 247)" }}
          color="inherit"
          variant="subtitle1"
          component="div"
        >
          {numSelected} selected
        </Typography>
      ) : (
        ""
      )}

      <Grid
        sx={{ display: numSelected > 0 ? "none" : "default" }}
        container
        spacing={2}
      >
        <Grid item xs={12}>
          <Tooltip title="Filter list">
            <IconButton onClick={() => setFilterOpen(!filterOpen)}>
              <FilterListIcon sx={{ color: "rgb(210, 213, 247)" }} />
            </IconButton>
          </Tooltip>
        </Grid>
        {filterOpen && (
          <Grid item>
            <FilterComponent handleFilterUpdate={handleFilterUpdate} />
          </Grid>
        )}
      </Grid>

      {numSelected > 0 ? (
        <>
          <Tooltip title="Delete">
            <IconButton onClick={() => setDeleteModalOpen(true)}>
              <DeleteIcon sx={{ color: "rgb(210, 213, 247)" }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Edit">
            <IconButton onClick={() => setEditModalOpen(true)}>
              <EditIcon sx={{ color: "rgb(210, 213, 247)" }} />
            </IconButton>
          </Tooltip>
        </>
      ) : (
        ""
      )}
    </Toolbar>
  );
};

export default function DiscordTable({
  rows,
  userData,
  setRefactoredData,
  onEditClick,
  onDeleteClick,
}) {
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("");
  const [filterByParams, setFilterByParams] = useState([]);
  const [selected, setSelected] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterOpen, setFilterOpen] = useState(false);
  const [originalRows, setOriginalRows] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [selectedAttachmentRow, setSelectedAttachmentRow] = useState(null);
  const columns = [
    {
      id: "timestamp",
      numeric: false,
      disablePadding: true,
      label: "Date",
    },
    {
      id: "username",
      numeric: false,
      disablePadding: true,
      label: "Username",
    },
    {
      id: "content",
      numeric: false,
      disablePadding: false,
      label: "Message",
    },
  ];

  useEffect(() => {
    if (originalRows === null && rows) {
      setOriginalRows(rows);
    }
  }, [rows, originalRows]);

  useEffect(() => {
    if (!filterOpen && originalRows != null) {
      setRefactoredData(originalRows);
    }
  }, [filterOpen, originalRows]);

  useEffect(() => {
    const filterRows = () => {
      let retArr = [];
      originalRows.forEach((x) => {
        let criteriaMet = true;
        filterByParams.every((param) => {
          if (param.filterType === "text") {
            let rowValue = x[param.filterName].toLowerCase();
            let filterValue = param.filterValue.toLowerCase();
            if (!rowValue.includes(filterValue)) {
              criteriaMet = false;
            }
            return criteriaMet;
          } else if (param.filterType === "date") {
            if (param.filterName === "startTime") {
              let startTime = Date.parse(param.filterValue);
              let rowTime = Date.parse(x.timestamp);
              if (rowTime < startTime) {
                criteriaMet = false;
              }
            } else if (param.filterName === "endTime") {
              let endTime = Date.parse(param.filterValue);
              let rowTime = Date.parse(x.timestamp);
              if (rowTime > endTime) {
                criteriaMet = false;
              }
            }
            return criteriaMet;
          }
        });
        if (criteriaMet) retArr.push(x);
      });

      setRefactoredData(retArr);
      setPage(0);
    };
    if (originalRows != null) {
      if (filterByParams.length > 0) filterRows();
      else setRefactoredData(originalRows);
    }
  }, [filterByParams]);

  const handleFilterUpdate = (filterName, filterValue, filterType) => {
    let filteredList = filterByParams.filter(
      (x) => x.filterName !== filterName
    );
    if (filterType === "text") {
      if (filterValue.length > 0)
        setFilterByParams([
          ...filteredList,
          {
            filterName: filterName,
            filterValue: filterValue,
            filterType: filterType,
          },
        ]);
      else setFilterByParams([...filteredList]);
    } else if (filterType === "date") {
      if (filterValue !== null && filterValue !== "Invalid Date") {
        setFilterByParams([
          ...filteredList,
          {
            filterName: filterName,
            filterValue: filterValue,
            filterType: filterType,
          },
        ]);
      } else setFilterByParams([...filteredList]);
    }
  };

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = rows
        .filter((x) => x.username === userData.username)
        .map((n) => n.id);
      setSelected(newSelecteds);
      return;
    } else {
      setSelected([]);
    }
  };
  const handleClick = (event, id) => {
    if (rows.filter((x) => x.id === id)[0]["username"] === userData.username) {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];
      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }
      setSelected(newSelected);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (name) => selected.indexOf(name) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <DiscordDeleteModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
      />
      <DiscordEditModal
        open={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
      />
      <DiscordAttachmentModal
        open={attachmentModalOpen}
        handleClose={async (e) => {
          console.log("Here is what comes back from closing the dialog - ", e);
          setAttachmentModalOpen(false);
          setSelectedAttachmentRow(null);
          let updatedArr = [];
          await rows.forEach((x) => {
            if (x.id === e.id) updatedArr.push(e);
            else updatedArr.push(x);
          });
          setRefactoredData(updatedArr);
        }}
        row={selectedAttachmentRow}
        userData={userData}
      />
      <Paper
        sx={{
          width: "100%",
          mb: 2,
          backgroundColor: "#2f3136",
          borderRadius: "6px",
          color: "rgb(88, 101, 242)",
        }}
      >
        <EnhancedTableToolbar
          setFilterOpen={setFilterOpen}
          filterOpen={filterOpen}
          numSelected={selected.length}
          handleFilterUpdate={handleFilterUpdate}
          setDeleteModalOpen={setDeleteModalOpen}
          setEditModalOpen={setEditModalOpen}
        />
        <TableContainer>
          <Table
            sx={{
              maxWidth: 774,
            }}
            aria-labelledby="tableTitle"
            size="small"
          >
            <EnhancedTableHead
              numSelected={selected.length}
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={
                rows.filter((x) => x.username === userData.username).length
              }
              columns={columns}
            />
            <TableBody>
              {rows
                .slice()
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);
                  const labelId = `enhanced-table-checkbox-${index}`;

                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.id}
                      selected={isItemSelected}
                    >
                      <TableCell
                        padding="checkbox"
                        sx={{ borderBottom: "1px solid rgb(88, 101, 242)" }}
                      >
                        <DiscordCheckBox
                          disabled={userData.username !== row["username"]}
                          color="primary"
                          checked={isItemSelected}
                          inputProps={{
                            "aria-labelledby": labelId,
                          }}
                        />
                      </TableCell>
                      {columns.map((column) => {
                        return (
                          <TableCell
                            sx={{
                              color: "rgb(210, 213, 247)",
                              borderBottom: "1px solid rgb(88, 101, 242)",
                              whiteSpace: "normal",
                              wordBreak:
                                column === "content" ? "break-word" : "normal",
                              cursor: "default",
                            }}
                            align="left"
                          >
                            {column.id === "timestamp"
                              ? new Date(
                                  Date.parse(row[column.id])
                                ).toLocaleString("en-US")
                              : row[column.id]}
                          </TableCell>
                        );
                      })}
                      <TableCell
                        padding="checkbox"
                        sx={{ borderBottom: "1px solid rgb(88, 101, 242)" }}
                      >
                        <Tooltip title="Attachments">
                          <IconButton
                            sx={{
                              display:
                                row.attachments.length === 0 ||
                                userData.username !== row.username
                                  ? "none"
                                  : "initial",
                            }}
                            disabled={row.attachments.length === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAttachmentRow(row);
                              setAttachmentModalOpen(true);
                            }}
                          >
                            <AttachmentIcon
                              sx={{ color: "rgb(210, 213, 247)" }}
                            />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          sx={{ color: "rgb(210, 213, 247)" }}
          rowsPerPageOptions={[5, 10, 25, 50, 100, 1000, 10000]}
          component="div"
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}

const FilterComponent = ({ handleFilterUpdate }) => {
  return (
    <Grid spacing={2} container>
      <Grid xs={12} item>
        <Grid spacing={2} container>
          <Grid xs={6} item>
            <DiscordDateTimePicker
              onChange={(e) => handleFilterUpdate("startTime", e, "date")}
              label="Start Time"
            />
          </Grid>
          <Grid xs={6} item>
            <DiscordDateTimePicker
              onChange={(e) => handleFilterUpdate("endTime", e, "date")}
              label="End Time"
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid item xs={6}>
        <DiscordTextField
          label="Username"
          onChange={(e) =>
            handleFilterUpdate("username", e.target.value, "text")
          }
        />
      </Grid>
      <Grid item xs={6}>
        <DiscordTextField
          onChange={(e) =>
            handleFilterUpdate("content", e.target.value, "text")
          }
          label="Message"
        />
      </Grid>
    </Grid>
  );
};
