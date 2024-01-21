import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import { Table as Tbl } from "@mui/material";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { SortDirection } from "../../enum/sort-direction";
import TableHead from "./components/table-head";

export type TableColumn<T> = {
  id: keyof T;
  disablePadding: boolean;
  label: string;
};

export type TableRow<T> = {
  data: T & { id: string };
  renderRow: (rowData: T & { id: string }) => React.ReactNode;
};

export type OrderProps<T> = {
  order: SortDirection;
  orderBy: keyof T;
  onRequestSort?: (order: SortDirection, orderBy: keyof T) => void;
};

type TableProps<T> = {
  columns: TableColumn<T>[];
  rows: TableRow<T>[];
  orderProps: OrderProps<T>;
  renderToolbarComponent?: (selectedRows: string[]) => React.ReactNode;
};

export default function Table<T>({
  columns,
  rows,
  orderProps,
  renderToolbarComponent,
}: TableProps<T>) {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [order, setOrder] = useState<SortDirection>(orderProps.order);
  const [orderBy, setOrderBy] = useState<keyof T>(orderProps.orderBy);

  useEffect(() => {
    setPage(0);
  }, [rows.length]);

  const handleRequestSort = (_: unknown, property: keyof T) => {
    const isAsc = orderBy === property && order === SortDirection.ASCENDING;
    const updatedOrder = isAsc
      ? SortDirection.DESCENDING
      : SortDirection.ASCENDING;
    setOrder(updatedOrder);
    setOrderBy(property);
    if (orderProps.onRequestSort) {
      orderProps.onRequestSort(updatedOrder, property);
    }
  };

  const isSelected = (id: string): boolean =>
    selectedRows.some((selectedId) => selectedId === id);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      setSelectedRows(rows.map((row) => row.data.id));
    } else {
      setSelectedRows([]);
    }
  };
  const handleClick = (_: unknown, id: Snowflake) => {
    if (isSelected(id)) {
      setSelectedRows((prevState) =>
        prevState.filter((selectedId) => selectedId !== id)
      );
    } else {
      setSelectedRows((prevState) => [...prevState, id]);
    }
  };

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - rows.length) : 0;

  return (
    <Box sx={{ width: "100%" }}>
      <Paper sx={{ width: "100%", marginBottom: 2, borderRadius: "6px" }}>
        {renderToolbarComponent?.(selectedRows)}
        <TableContainer sx={{ overflowX: "hidden" }}>
          <Tbl sx={{ maxWidth: "774px" }} size="small">
            <TableHead
              orderBy={orderBy}
              columns={columns}
              order={order}
              handleSelectAllClick={handleSelectAllClick}
              handleRequestSort={handleRequestSort}
              rowCount={rows.length}
              selectedRows={selectedRows}
            />
            <TableBody>
              {rows
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  const isItemSelected = isSelected(row.data.id);
                  return (
                    <TableRow
                      hover
                      onClick={(event) => handleClick(event, row.data.id)}
                      role="checkbox"
                      aria-checked={isItemSelected}
                      tabIndex={-1}
                      key={row.data.id}
                      selected={isItemSelected}
                    >
                      {row.renderRow(row.data)}
                    </TableRow>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow
                  sx={{
                    height: 33 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          </Tbl>
        </TableContainer>
        <TablePagination
          sx={{ userSelect: "none" }}
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
