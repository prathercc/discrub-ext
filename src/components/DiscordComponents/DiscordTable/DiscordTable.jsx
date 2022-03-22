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
import DeleteModal from "../../Modals/DeleteModal";
import EditModal from "../../Modals/EditModal";
import AttachmentModal from "../../Modals/AttachmentModal";
import AttachmentIcon from "@mui/icons-material/Attachment";
import {
  textSecondary,
  textPrimary,
  discordSecondary,
  discordPrimary,
} from "../../../styleConstants";
import MessageChip from "../../Chips/MessageChip";
import DiscordTypography from "../DiscordTypography/DiscordTypography";
import { Stack } from "@mui/material";
import ExportButtonGroup from "../../Export/ExportButtonGroup";

const FormattedContent = ({ message, recipients }) => {
  const [displayMessage, setDisplayMessage] = useState("");
  useEffect(() => {
    const updateMessage = async () => {
      if (message && recipients) {
        let msg = message;
        for (let [key, value] of recipients.entries()) {
          msg = msg.replace(`<@${key}>`, `@${value}`);
          msg = msg.replace(`<@!${key}>`, `@${value}`);
        }
        setDisplayMessage(msg);
      } else {
        setDisplayMessage("");
      }
    };
    updateMessage();
  }, [message, recipients]);

  return (
    <>
      {displayMessage.length > 60 ? (
        <Tooltip title={displayMessage}>
          <DiscordTypography variant="caption">
            {displayMessage.slice(0, 60)}...
          </DiscordTypography>
        </Tooltip>
      ) : (
        <DiscordTypography variant="caption">
          {displayMessage}
        </DiscordTypography>
      )}
    </>
  );
};

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
          sx={{ borderBottom: `1px solid ${textPrimary}` }}
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
      <Stack sx={{ width: "100%" }} direction="column">
        <Stack sx={{ width: "100%" }} alignItems="baseline" direction="column">
          <Stack
            sx={{ width: "100%" }}
            direction="row"
            justifyContent="space-between"
            zIndex={5000}
          >
            <Tooltip title="Filter list">
              <IconButton onClick={() => setFilterOpen(!filterOpen)}>
                <FilterListIcon sx={{ color: textSecondary }} />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filter list">
              <IconButton onClick={() => console.log("Export messages!")}>
                <ExportButtonGroup />
              </IconButton>
            </Tooltip>
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

export default function DiscordTable({ rows, userData, setRefactoredData }) {
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
  const [recipients, setRecipients] = useState(null);
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
    const parseRecipients = async () => {
      let uniquieRecipients = new Map();
      await rows.forEach((x) => {
        uniquieRecipients.set(x.author.id, x.author.username);
      });
      setRecipients(uniquieRecipients);
    };
    if (originalRows === null && rows) {
      parseRecipients();
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
            if (param.filterName === "attachmentName") {
              let csvAttachments = "";
              x.attachments.forEach((attachment) => {
                csvAttachments += attachment.filename + ",";
              });
              if (
                !csvAttachments
                  .toLowerCase()
                  .includes(param.filterValue.toLowerCase())
              ) {
                criteriaMet = false;
              }
            } else {
              let rowValue = x[param.filterName].toLowerCase();
              let filterValue = param.filterValue.toLowerCase();
              if (!rowValue.includes(filterValue)) {
                criteriaMet = false;
              }
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
      const newSelecteds = rows.map((n) => n.id);
      setSelected(newSelecteds);
      return;
    } else {
      setSelected([]);
    }
  };
  const handleClick = (event, id) => {
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
      <DeleteModal
        setOriginalRows={setOriginalRows}
        originalRows={originalRows}
        open={deleteModalOpen}
        handleClose={(returnRows) => {
          setDeleteModalOpen(false);
          setRefactoredData(returnRows);
          if (JSON.stringify(returnRows) !== JSON.stringify(rows))
            setSelected([]);
        }}
        rows={rows}
        selected={selected}
        userData={userData}
      />
      <EditModal
        setOriginalRows={setOriginalRows}
        originalRows={originalRows}
        userData={userData}
        open={editModalOpen}
        handleClose={(editedRows) => {
          setEditModalOpen(false);
          setRefactoredData(editedRows);
        }}
        selected={selected}
        rows={rows}
      />
      <AttachmentModal
        open={attachmentModalOpen}
        handleClose={async (e) => {
          let updatedSelected = await selected.filter(
            (x) => x !== selectedAttachmentRow.id
          );
          setSelected(updatedSelected);
          setAttachmentModalOpen(false);
          let updatedArr = [];
          await rows.forEach((x) => {
            //Entire message was deleted
            if (e === null) {
              if (x.id !== selectedAttachmentRow.id) {
                updatedArr.push(x);
              }
            }
            //Attachment(s) trimmed out
            else {
              if (x.id === e.id) {
                updatedArr.push({ ...e, username: e.author.username });
              } else updatedArr.push(x);
            }
          });
          setSelectedAttachmentRow(null);
          setRefactoredData(updatedArr);
        }}
        row={selectedAttachmentRow}
        userData={userData}
      />
      <Paper
        sx={{
          width: "100%",
          mb: 2,
          backgroundColor: discordSecondary,
          borderRadius: "6px",
          color: textPrimary,
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
              rowCount={rows.length}
              columns={columns}
            />
            <TableBody>
              {rows
                .slice()
                .sort(getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => {
                  const isItemSelected = isSelected(row.id);

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
                      <td
                        style={{
                          textAlign: "left",
                          verticalAlign: "middle",
                          borderBottom: `1px solid ${textPrimary}`,
                        }}
                        colspan={4}
                      >
                        <Grid container>
                          <Grid xs={4} item>
                            <Grid sx={{ paddingLeft: 2 }} container>
                              <Grid xs={12} item>
                                <MessageChip
                                  sx={{
                                    border: "none",
                                    backgroundColor: "transparent",
                                    userSelect: "none",
                                  }}
                                  username={row.username}
                                  avatar={`https://cdn.discordapp.com/avatars/${row.author.id}/${row.author.avatar}.png`}
                                  content={row.username}
                                />
                              </Grid>
                              <Grid px={1} item xs={12}>
                                <DiscordTypography
                                  sx={{ userSelect: "none" }}
                                  variant="caption"
                                >
                                  {new Date(
                                    Date.parse(row.timestamp)
                                  ).toLocaleString("en-US")}
                                </DiscordTypography>
                              </Grid>
                            </Grid>
                          </Grid>
                          <Grid
                            sx={{
                              display: "flex",
                              alignItems: "center",
                            }}
                            item
                            xs={8}
                            px={1}
                          >
                            <FormattedContent
                              recipients={recipients}
                              message={row.content}
                            />
                          </Grid>
                        </Grid>
                      </td>
                      <td
                        colspan={1}
                        style={{
                          textAlign: "center",
                          verticalAlign: "middle",
                          borderBottom: `1px solid ${textPrimary}`,
                        }}
                      >
                        <Tooltip title="Attachments">
                          <IconButton
                            disabled={row.attachments.length === 0}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedAttachmentRow(row);
                              setAttachmentModalOpen(true);
                            }}
                            color="primary"
                          >
                            <AttachmentIcon
                              sx={{
                                color:
                                  row.attachments.length === 0
                                    ? discordPrimary
                                    : textSecondary,
                              }}
                            />
                          </IconButton>
                        </Tooltip>
                      </td>
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell
                    sx={{ borderBottom: `1px solid ${textPrimary}` }}
                    colSpan={6}
                  />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          sx={{ color: textSecondary, userSelect: "none" }}
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
      <Grid item xs={12}>
        <DiscordTextField
          onChange={(e) =>
            handleFilterUpdate("attachmentName", e.target.value, "text")
          }
          label="Attachment Name"
        />
      </Grid>
    </Grid>
  );
};
