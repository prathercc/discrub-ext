import React, { useState, useRef, useContext } from "react";
import ButtonGroup from "@mui/material/ButtonGroup";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClickAwayListener from "@mui/material/ClickAwayListener";
import Grow from "@mui/material/Grow";
import Paper from "@mui/material/Paper";
import Popper from "@mui/material/Popper";
import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import {
  Box,
  Stack,
  Typography,
  Button,
  CircularProgress,
} from "@mui/material";
import { MessageContext } from "../../context/message/MessageContext";
import ExportButtonGroupStyles from "./ExportButtonGroup.styles";
import MessageMock from "./MessageMock";
import ExportUtils from "./ExportUtils";

const options = ["HTML", "PDF", "JSON"];

const ExportButtonGroup = () => {
  const classes = ExportButtonGroupStyles();

  const { state: messageState, getExportTitle } = useContext(MessageContext);
  const { messages, filters, filteredMessages, threads } = messageState;
  const exportMessages = filters.length > 0 ? filteredMessages : messages;

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [printing, setPrinting] = useState(false);

  const componentRef = useRef();

  const { downloadHTML, downloadPDF, downloadJSON, loadAllContent } =
    new ExportUtils(
      componentRef,
      () => setPrinting(false),
      `message-data-${exportMessages.length - 1}`
    );

  const handleMenuItemClick = (event, index) => {
    setSelectedIndex(index);
    setOpen(false);
  };

  const handleToggle = () => {
    setOpen((prevOpen) => !prevOpen);
  };

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) {
      return;
    }

    setOpen(false);
  };

  const handleDownload = async (option) => {
    setPrinting(true);
    if (option === "JSON") downloadJSON(exportMessages);
    else {
      const allContentLoaded = await loadAllContent();
      if (allContentLoaded) {
        switch (option) {
          case "PDF":
            downloadPDF();
            break;
          case "HTML":
            downloadHTML();
            break;
          default:
            break;
        }
      }
    }
  };

  return (
    <>
      <Box className={classes.boxContainer}>
        <Stack
          direction="column"
          alignItems="center"
          justifyContent="center"
          ref={componentRef}
          className={classes.stackMessageContainer}
        >
          <Stack justifyContent="center" alignItems="center">
            {getExportTitle()}
            <Typography className={classes.typographyId}>
              UTC mm/dd/yyyy hh:mm:ss
            </Typography>
          </Stack>
          {printing &&
            exportMessages.map((row, index) => {
              return <MessageMock row={row} index={index} threads={threads} />;
            })}
        </Stack>
      </Box>

      {!printing && (
        <ButtonGroup variant="contained" ref={anchorRef}>
          <Button onClick={() => handleDownload(options[selectedIndex])}>
            {options[selectedIndex]}
          </Button>
          <Button
            startIcon={<ArrowDropDownIcon />}
            size="small"
            onClick={handleToggle}
          />
        </ButtonGroup>
      )}
      {printing && (
        <Stack justifyContent="center" alignItems="center">
          <CircularProgress />
        </Stack>
      )}

      <Popper
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
      >
        {({ TransitionProps, placement }) => (
          <Grow
            {...TransitionProps}
            style={{
              transformOrigin:
                placement === "bottom" ? "center top" : "center bottom",
            }}
          >
            <Paper>
              <ClickAwayListener onClickAway={handleClose}>
                <MenuList>
                  {options.map((option, index) => (
                    <MenuItem
                      key={option}
                      selected={index === selectedIndex}
                      onClick={(event) => handleMenuItemClick(event, index)}
                    >
                      {option}
                    </MenuItem>
                  ))}
                </MenuList>
              </ClickAwayListener>
            </Paper>
          </Grow>
        )}
      </Popper>
    </>
  );
};
export default ExportButtonGroup;
