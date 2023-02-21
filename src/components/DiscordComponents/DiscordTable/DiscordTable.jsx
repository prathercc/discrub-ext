import React, { useState, useEffect, useContext } from "react";
import Box from "@mui/material/Box";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import DeleteModal from "../../Modals/DeleteModal";
import EditModal from "../../Modals/EditModal";
import AttachmentModal from "../../Modals/AttachmentModal";
import EnhancedTableHead from "./EnhancedTableHead";
import EnhancedTableToolbar from "./EnhancedTableToolbar";
import { MessageContext } from "../../../context/message/MessageContext";
import DiscordTableStyles from "./DiscordTable.styles";
import DiscordTableMessage from "./DiscordTableMessage";
import EmbedModal from "../../Modals/EmbedModal";

export default function DiscordTable() {
  const classes = DiscordTableStyles();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [filterOpen, setFilterOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [attachmentModalOpen, setAttachmentModalOpen] = useState(false);
  const [embedModalOpen, setEmbedModalOpen] = useState(false);
  const columns = [
    {
      id: "timestamp",
      disablePadding: true,
      label: "Date",
    },
    {
      id: "username",
      disablePadding: true,
      label: "Username",
    },
    {
      id: "content",
      disablePadding: false,
      label: "Message",
    },
  ];
  const {
    state: messageState,
    setSelected,
    setOrder,
  } = useContext(MessageContext);
  const {
    filteredMessages,
    messages,
    filters,
    selectedMessages,
    order,
    orderBy,
  } = messageState;
  const displayRows =
    filterOpen && filters.length ? filteredMessages : messages;

  useEffect(() => {
    setPage(0);
  }, [filters, filterOpen]);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc", property);
  };

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      setSelected(displayRows.map((n) => n.id));
      return;
    } else {
      setSelected([]);
    }
  };
  const handleClick = (event, id) => {
    const selectedIndex = selectedMessages.indexOf(id);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedMessages, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedMessages.slice(1));
    } else if (selectedIndex === selectedMessages.length - 1) {
      newSelected = newSelected.concat(selectedMessages.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedMessages.slice(0, selectedIndex),
        selectedMessages.slice(selectedIndex + 1)
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

  const isSelected = (name) => selectedMessages.indexOf(name) !== -1;

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - displayRows.length) : 0;

  return (
    <Box className={classes.box}>
      <DeleteModal
        open={deleteModalOpen}
        handleClose={() => setDeleteModalOpen(false)}
      />
      <EditModal
        open={editModalOpen}
        handleClose={() => setEditModalOpen(false)}
      />
      <AttachmentModal
        open={attachmentModalOpen}
        handleClose={() => setAttachmentModalOpen(false)}
      />
      <EmbedModal
        open={embedModalOpen}
        handleClose={() => setEmbedModalOpen(false)}
      />
      <Paper className={classes.paper}>
        <EnhancedTableToolbar
          setFilterOpen={setFilterOpen}
          filterOpen={filterOpen}
          setDeleteModalOpen={setDeleteModalOpen}
          setEditModalOpen={setEditModalOpen}
        />
        <TableContainer>
          <Table className={classes.table} size="small">
            <EnhancedTableHead
              order={order}
              orderBy={orderBy}
              onSelectAllClick={handleSelectAllClick}
              onRequestSort={handleRequestSort}
              rowCount={displayRows.length}
              columns={columns}
            />
            <TableBody>
              {displayRows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
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
                      <DiscordTableMessage
                        row={row}
                        openAttachmentModal={() => setAttachmentModalOpen(true)}
                        openEmbedModal={() => setEmbedModalOpen(true)}
                      />
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  sx={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell className={classes.tablecell} colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          className={classes.tablePagination}
          rowsPerPageOptions={[5, 10, 25, 50, 100, 1000, 10000]}
          component="div"
          count={displayRows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Box>
  );
}
